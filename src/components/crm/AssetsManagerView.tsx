import React, { useState, useEffect, useRef } from 'react';
import { 
  Image, 
  UploadCloud, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Check, 
  Copy, 
  Search, 
  Filter, 
  Plus, 
  X, 
  FileCheck, 
  Stamp, 
  Shield, 
  Sparkles, 
  PenTool, 
  Download, 
  Layers, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { apiService } from '../../services/apiService';

export interface AssetItem {
  name: string;
  title?: string;
  category?: 'logo' | 'seal' | 'signature' | 'partner' | 'watermark' | 'certificate' | 'graphic';
  description?: string;
  url: string;
  type: string;
  sizeBytes?: number;
  updatedAt?: string;
  isPreset?: boolean;
  isActive?: boolean;
}

type CategoryFilter = 'all' | 'logo' | 'seal' | 'signature' | 'partner' | 'watermark' | 'graphic';

export function AssetsManagerView() {
  const [assets, setAssets] = useState<{ custom: AssetItem[]; presets: AssetItem[] }>({ custom: [], presets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [tabView, setTabView] = useState<'all' | 'custom' | 'presets'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [activeAsset, setActiveAsset] = useState<AssetItem | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<AssetItem | null>(null);

  // Form states for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'logo' | 'seal' | 'signature' | 'partner' | 'watermark' | 'certificate' | 'graphic'>('logo');
  const [formDescription, setFormDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const newFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getAssets();
      if (res.success && res.data) {
        setAssets({
          custom: res.data.custom || [],
          presets: res.data.presets || []
        });
      }
    } catch (e) {
      console.error('Failed to load assets', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleOpenAddModal = () => {
    setFormTitle('');
    setFormCategory('logo');
    setFormDescription('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (asset: AssetItem) => {
    setActiveAsset(asset);
    setFormTitle(asset.title || asset.name);
    setFormCategory(asset.category || (asset.isPreset ? 'partner' : 'logo'));
    setFormDescription(asset.description || '');
    setIsEditModalOpen(true);
  };

  const handleOpenReplaceModal = (asset: AssetItem) => {
    setActiveAsset(asset);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsReplaceModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    if (!formTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFormTitle(cleanName);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }

    setIsUploading(true);
    try {
      const res = await apiService.uploadAsset(selectedFile, {
        title: formTitle,
        category: formCategory,
        description: formDescription
      });

      if (res.success) {
        setIsAddModalOpen(false);
        await fetchAssets();
      } else {
        alert(res.error || 'Ошибка загрузки ассета');
      }
    } catch (err: any) {
      alert('Ошибка при сохранении: ' + (err?.message || 'Неизвестная ошибка'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset) return;

    setIsSaving(true);
    try {
      const res = await apiService.updateAsset(activeAsset.name, {
        title: formTitle,
        category: formCategory,
        description: formDescription
      });

      if (res.success) {
        setIsEditModalOpen(false);
        await fetchAssets();
      } else {
        alert(res.error || 'Ошибка обновления метаданных');
      }
    } catch (err: any) {
      alert('Ошибка обновления: ' + (err?.message || 'Неизвестная ошибка'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReplaceFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset || !selectedFile) {
      alert('Пожалуйста, выберите новый файл для замены');
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiService.replaceAssetFile(activeAsset.name, selectedFile, {
        title: formTitle || activeAsset.title,
        category: formCategory || activeAsset.category,
        description: formDescription || activeAsset.description
      });

      if (res.success) {
        setIsReplaceModalOpen(false);
        await fetchAssets();
      } else {
        alert(res.error || 'Ошибка замены файла');
      }
    } catch (err: any) {
      alert('Ошибка замены: ' + (err?.message || 'Неизвестная ошибка'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportPreset = async (preset: AssetItem) => {
    setIsSaving(true);
    try {
      const res = await apiService.importPresetAsset(preset.name, {
        title: preset.title || preset.name,
        category: 'partner',
        description: 'Импортировано из системных логотипов'
      });

      if (res.success) {
        await fetchAssets();
        setTabView('custom');
      } else {
        alert(res.error || 'Ошибка импорта пресета');
      }
    } catch (err: any) {
      alert('Ошибка: ' + (err?.message || 'Неизвестная ошибка'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmAsset) return;
    setIsSaving(true);
    try {
      const res = await apiService.deleteAsset(deleteConfirmAsset.name);
      if (res.success) {
        setDeleteConfirmAsset(null);
        await fetchAssets();
      } else {
        alert(res.error || 'Ошибка удаления файла');
      }
    } catch (err: any) {
      alert('Ошибка удаления: ' + (err?.message || 'Неизвестная ошибка'));
    } finally {
      setIsSaving(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Filter items
  const filterList = (items: AssetItem[]) => {
    return items.filter(item => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (item.title && item.title.toLowerCase().includes(q)) || 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  };

  const filteredCustom = filterList(assets.custom);
  const filteredPresets = filterList(assets.presets);

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'seal':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200"><Stamp className="w-3 h-3" />Печать</span>;
      case 'signature':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200"><PenTool className="w-3 h-3" />Подпись</span>;
      case 'partner':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200"><Shield className="w-3 h-3" />Партнер</span>;
      case 'watermark':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"><Layers className="w-3 h-3" />Водяной знак</span>;
      case 'certificate':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><FileCheck className="w-3 h-3" />Сертификат</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200"><Sparkles className="w-3 h-3" />Логотип</span>;
    }
  };

  const renderAssetCard = (asset: AssetItem, isCustom: boolean) => (
    <div 
      key={asset.name} 
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
    >
      <div className="h-36 bg-slate-50 flex items-center justify-center p-4 relative border-b border-gray-100">
        <div 
          className="absolute inset-0 opacity-40" 
          style={{ 
            backgroundImage: 'repeating-linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0), repeating-linear-gradient(45deg, #e2e8f0 25%, #f8fafc 25%, #f8fafc 75%, #e2e8f0 75%, #e2e8f0)', 
            backgroundPosition: '0 0, 8px 8px', 
            backgroundSize: '16px 16px' 
          }}
        />
        <img 
          src={asset.url} 
          alt={asset.title || asset.name} 
          className="max-h-full max-w-full object-contain relative z-10 transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 z-20">
          {getCategoryBadge(asset.category)}
        </div>
      </div>

      <div className="p-3.5 bg-white flex flex-col gap-2 flex-grow">
        <div>
          <h4 className="text-xs font-bold text-gray-900 truncate" title={asset.title || asset.name}>
            {asset.title || asset.name}
          </h4>
          <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5" title={asset.name}>
            {asset.name}
          </p>
          {asset.description && (
            <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
              {asset.description}
            </p>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 mt-auto flex-wrap">
          <button
            type="button"
            onClick={() => copyUrl(asset.url)}
            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Скопировать постоянный URL"
          >
            {copiedUrl === asset.url ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>URL</span>
          </button>

          {isCustom ? (
            <>
              <button
                type="button"
                onClick={() => handleOpenEditModal(asset)}
                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                title="Редактировать название и категорию"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenReplaceModal(asset)}
                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors cursor-pointer"
                title="Заменить файл изображения (с сохранением URL)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirmAsset(asset)}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Удалить ассет"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleImportPreset(asset)}
              className="py-1.5 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Добавить в редактируемые пользовательские ассеты"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>В мои ассеты</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Stamp className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Менеджер логотипов, печатей и факсимиле
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Управление графическими ресурсами для коммерческих предложений (КП), протоколов КИМ, свидетельств поверки и типовых бланков «ДС-Инжиниринг». Поддерживается загрузка, замена, редактирование метаданных и удаление.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить логотип или печать</span>
            </button>

            <button
              type="button"
              onClick={fetchAssets}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Обновить список ассетов"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
            {[
              { id: 'all', label: 'Все ассеты', icon: Layers },
              { id: 'logo', label: 'Логотипы', icon: Sparkles },
              { id: 'seal', label: 'Печати и штампы', icon: Stamp },
              { id: 'signature', label: 'Подписи / Факсимиле', icon: PenTool },
              { id: 'partner', label: 'Производители САПР/КИМ', icon: Shield },
              { id: 'watermark', label: 'Водяные знаки', icon: Layers },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или файлу..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* Scope View Switcher */}
        <div className="flex items-center gap-2 pt-2 text-xs">
          <button
            type="button"
            onClick={() => setTabView('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              tabView === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Все ({assets.custom.length + assets.presets.length})
          </button>
          <button
            type="button"
            onClick={() => setTabView('custom')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              tabView === 'custom' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Пользовательские и загруженные ({assets.custom.length})
          </button>
          <button
            type="button"
            onClick={() => setTabView('presets')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              tabView === 'presets' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Системные пресеты ({assets.presets.length})
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-xl border border-gray-200">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Custom Uploaded Section */}
          {(tabView === 'all' || tabView === 'custom') && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-indigo-600" />
                  <span>Пользовательские логотипы, печати и подписи ({filteredCustom.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Загрузить новый</span>
                </button>
              </div>

              {filteredCustom.length === 0 ? (
                <div className="text-center p-10 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                  <Image className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Нет файлов в этой категории</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Нажмите кнопку «Добавить логотип или печать», чтобы загрузить изображение PNG/SVG/JPG.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredCustom.map((asset) => renderAssetCard(asset, true))}
                </div>
              )}
            </div>
          )}

          {/* System Presets Section */}
          {(tabView === 'all' || tabView === 'presets') && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-600" />
                  <span>Системные пресеты производителей САПР и КИМ ({filteredPresets.length})</span>
                </h4>
                <span className="text-xs text-slate-400">Встроенная библиотека брендов</span>
              </div>

              {filteredPresets.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                  <p className="text-xs text-slate-500">Ничего не найдено по заданному поисковому запросу</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredPresets.map((asset) => renderAssetCard(asset, false))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: ADD NEW ASSET ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-sm border border-gray-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Добавление логотипа или печати</h3>
                  <p className="text-xs text-gray-500">Загрузка графического файла в хранилище сайта</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              {/* File Dropzone */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Файл изображения *</label>
                <input
                  type="file"
                  ref={newFileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  className="hidden"
                />
                <div 
                  onClick={() => newFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-2"
                >
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img src={previewUrl} alt="Preview" className="max-h-24 max-w-full object-contain mx-auto" />
                      <p className="text-[11px] text-indigo-600 font-semibold">{selectedFile?.name}</p>
                      <span className="text-[10px] text-gray-400">Нажмите, чтобы выбрать другой файл</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-indigo-500" />
                      <p className="font-bold text-gray-700">Нажмите для выбора файла</p>
                      <p className="text-[11px] text-gray-400">Поддерживаются PNG (с прозрачностью), SVG, WebP, JPG до 25 МБ</p>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Название ассета *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Например: Официальная круглая печать ООО ДС-Инжиниринг"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Тип / Категория</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="logo">Логотип компании / Бренд</option>
                  <option value="seal">Официальная печать / Штамп</option>
                  <option value="signature">Факсимиле подписи руководителя/инженера</option>
                  <option value="partner">Логотип партнера / Производителя САПР-КИМ</option>
                  <option value="watermark">Водяной знак документа</option>
                  <option value="certificate">Знак аккредитации / Сертификат</option>
                  <option value="graphic">Прочая графика</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Описание / Назначение</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Для использования в коммерческих предложениях и протоколах испытаний"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Загрузить и сохранить</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT ASSET METADATA ================= */}
      {isEditModalOpen && activeAsset && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-sm border border-gray-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Редактирование ассета</h3>
                  <p className="text-xs text-gray-500 font-mono">{activeAsset.name}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Image Preview */}
            <div className="h-28 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-center p-3 relative">
              <img src={activeAsset.url} alt={activeAsset.name} className="max-h-full max-w-full object-contain" />
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Название ассета *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Тип / Категория</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="logo">Логотип компании / Бренд</option>
                  <option value="seal">Официальная печать / Штамп</option>
                  <option value="signature">Факсимиле подписи</option>
                  <option value="partner">Логотип партнера / Производителя САПР-КИМ</option>
                  <option value="watermark">Водяной знак документа</option>
                  <option value="certificate">Знак аккредитации / Сертификат</option>
                  <option value="graphic">Прочая графика</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Описание / Примечания</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Сохранить изменения</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REPLACE ASSET FILE ================= */}
      {isReplaceModalOpen && activeAsset && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-sm border border-gray-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Замена файла изображения</h3>
                  <p className="text-xs text-gray-500">Постоянный URL и привязки к документам сохранятся</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsReplaceModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceFile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Текущий файл</span>
                  <div className="h-20 flex items-center justify-center">
                    <img src={activeAsset.url} alt="Current" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono truncate block">{activeAsset.name}</span>
                </div>

                <div 
                  onClick={() => replaceFileInputRef.current?.click()}
                  className="p-3 bg-indigo-50/40 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-600 text-center cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <span className="text-[10px] text-indigo-700 uppercase font-bold block">Новый файл</span>
                  <input
                    type="file"
                    ref={replaceFileInputRef}
                    onChange={handleFileSelect}
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="h-20 flex items-center justify-center">
                      <img src={previewUrl} alt="New Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-20 flex flex-col items-center justify-center text-indigo-600">
                      <UploadCloud className="w-6 h-6 mb-1" />
                      <span className="text-[11px] font-bold">Выбрать файл</span>
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 font-mono truncate block">
                    {selectedFile?.name || 'Нажмите для выбора'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Замена файла автоматически обновит логотип или печать во всех коммерческих предложениях и свидетельствах, ссылающихся на этот ресурс.
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !selectedFile}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Применить замену</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirmAsset && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-sm border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-gray-900">Удалить этот графический ассет?</h3>
              <p className="text-xs text-gray-500">
                Вы собираетесь безвозвратно удалить файл <strong className="text-gray-800">{deleteConfirmAsset.title || deleteConfirmAsset.name}</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-center">
              <img src={deleteConfirmAsset.url} alt="Delete Target" className="max-h-20 object-contain" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAsset(null)}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSaving}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Да, удалить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
