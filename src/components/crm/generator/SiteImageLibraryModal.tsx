import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Image as ImageIcon, 
  Check, 
  Layers, 
  Cpu, 
  Activity, 
  Boxes, 
  Building 
} from 'lucide-react';
import { SITE_IMAGE_LIBRARY, SiteLibraryImage } from '../../../data/siteImageLibrary';

interface SiteImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: { url: string; title: string; description: string }) => void;
  isDark?: boolean;
}

export const SiteImageLibraryModal: React.FC<SiteImageLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  isDark = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredImages = useMemo(() => {
    return SITE_IMAGE_LIBRARY.filter(img => {
      const matchCat = selectedCategory === 'all' || img.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        img.title.toLowerCase().includes(q) || 
        img.description.toLowerCase().includes(q) ||
        img.categoryLabel.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl flex flex-col max-h-[88vh] overflow-hidden transition-colors ${
          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold">Медиа-библиотека сайта: Изображения для ТКП и ТЗ</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Выберите профессиональное изображение КИМ, 3D-сканера, карты GD&T или изделия для вставки в коммерческое предложение
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300 shadow-2xs'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className={`p-4 border-b space-y-3 shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        }`}>
          {/* Search Input */}
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию детали, КИМ, типу измерений или стандарту..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Все ({SITE_IMAGE_LIBRARY.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('equipment')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'equipment'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Оборудование и КИМ</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('gdt_metrology')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'gdt_metrology'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Метрология и GD&T</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('parts')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'parts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Контролируемые детали</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('lab')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'lab'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Лаборатория</span>
            </button>
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredImages.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Изображений не найдено</p>
              <p className="text-xs mt-1">Попробуйте изменить категорию или поисковый запрос</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredImages.map((img) => (
                <div
                  key={img.id}
                  className={`group rounded-xl border overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-blue-500/70 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950/40">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                        {img.categoryLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-bold text-xs line-clamp-1">{img.title}</h4>
                      <p className={`text-[11px] line-clamp-2 mt-1 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {img.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectImage({
                          url: img.url,
                          title: img.title,
                          description: img.description
                        });
                        onClose();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Вставить в документ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex items-center justify-between text-xs shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <span>Доступно {filteredImages.length} изображений в библиотеке</span>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
