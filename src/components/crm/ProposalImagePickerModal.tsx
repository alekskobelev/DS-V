import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Search, 
  Check, 
  Layers, 
  Cpu, 
  FileText,
  Trash2
} from 'lucide-react';
import { PROPOSAL_MEDIA_LIBRARY, MediaLibraryItem } from '../../data/proposalMediaLibrary';

interface ProposalImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, title?: string) => void;
  title?: string;
  initialImageUrl?: string;
}

export const ProposalImagePickerModal: React.FC<ProposalImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Вставка изображения в КП',
  initialImageUrl = ''
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState(initialImageUrl);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered library items
  const filteredLibrary = PROPOSAL_MEDIA_LIBRARY.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения (PNG, JPG, SVG, WebP)');
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUpload = () => {
    if (uploadedDataUrl) {
      onSelectImage(uploadedDataUrl, uploadedFileName);
      onClose();
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onSelectImage(customUrl.trim(), 'Изображение по ссылке');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-500">Библиотека сайта, загрузка файла с диска или URL-ссылка</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3.5 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Библиотека сайта ({PROPOSAL_MEDIA_LIBRARY.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Загрузка файла</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3.5 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>По ссылке (URL)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: SITE MEDIA LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Все' },
                    { id: 'equipment', label: 'Оборудование' },
                    { id: 'schemes', label: 'Схемы / GD&T' },
                    { id: 'software', label: 'ПО' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по названию..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Grid of Library Assets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredLibrary.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectImage(item.url, item.title);
                      onClose();
                    }}
                    className="group border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-2.5 bg-white dark:bg-slate-950/60 hover:shadow-md transition-all cursor-pointer flex gap-3 items-center"
                  >
                    <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{item.categoryLabel}</div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4 text-center py-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
              />

              {!uploadedDataUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 dark:bg-slate-950/40 hover:bg-blue-50/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Нажмите для выбора файла с компьютера</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Поддерживаются PNG, JPG, WebP, SVG (до 10 МБ)</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-w-xs mx-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-2 bg-slate-50 dark:bg-slate-950 shadow-sm">
                    <img
                      src={uploadedDataUrl}
                      alt={uploadedFileName}
                      className="max-h-48 w-full object-contain mx-auto rounded"
                    />
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 pt-2 truncate">
                      {uploadedFileName}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedDataUrl(null);
                        setUploadedFileName('');
                      }}
                      className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Выбрать другой файл</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyUpload}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Вставить в документ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIRECT URL */}
          {activeTab === 'url' && (
            <div className="space-y-4 py-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Прямая ссылка на изображение (HTTPS URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleApplyUrl}
                    disabled={!customUrl.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    Вставить
                  </button>
                </div>
              </div>

              {customUrl && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 max-w-sm mx-auto">
                  <div className="text-[10px] text-slate-400 mb-1">Предпросмотр по ссылке:</div>
                  <img
                    src={customUrl}
                    alt="Предпросмотр"
                    className="max-h-40 mx-auto object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
