import React, { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Eye, 
  ExternalLink, 
  Check, 
  Tag, 
  Cpu, 
  Download, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  FileText,
  Sparkles,
  ShoppingBag,
  Info
} from 'lucide-react';
import { Product } from '../../types';

interface ProductVisualPreviewProps {
  product: Partial<Product>;
  viewMode?: 'split' | 'editor' | 'preview';
}

export const ProductVisualPreview: React.FC<ProductVisualPreviewProps> = ({
  product,
  viewMode = 'split'
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [viewType, setViewType] = useState<'card' | 'detail'>('card');
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState<number>(0);

  const name = product.name || 'Название оборудования или ПО';
  const brand = product.brand || 'Производитель / Бренд';
  const price = product.price || 'По запросу';
  const badge = product.badge || '';
  const shortDesc = product.shortDescription || 'Краткое описание оборудования или программного продукта...';
  const fullDesc = product.fullDescription || shortDesc;
  const image = product.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  const features = Array.isArray(product.features) ? product.features : [];
  const specs = (product.specs && typeof product.specs === 'object') ? product.specs : {};
  const isSoftware = product.type === 'software';

  const galleryList = Array.isArray(product.gallery) && product.gallery.length > 0 
    ? [image, ...product.gallery.filter(g => g !== image)]
    : [image];

  return (
    <div className="w-full bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
      {/* Top Preview Control Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live-предпросмотр товара
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
            {isSoftware ? 'Программное обеспечение' : 'Оборудование / КИМ'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Card / Detail Switcher */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewType('card')}
              className={`px-4 py-1 rounded-md transition-all font-medium ${
                viewType === 'card'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Вид в каталоге
            </button>
            <button
              type="button"
              onClick={() => setViewType('detail')}
              className={`px-4 py-1 rounded-md transition-all font-medium ${
                viewType === 'detail'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Карточка товара
            </button>
          </div>

          {/* Desktop / Mobile Switcher */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="ПК вид"
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'desktop' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Мобильный вид"
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'mobile' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Frame Container */}
      <div className="p-4 sm:p-6 bg-slate-100 flex justify-center items-start min-h-[420px] overflow-auto">
        <div
          className={`transition-all duration-300 w-full ${
            viewport === 'mobile'
              ? 'max-w-[390px] bg-white rounded-[32px] p-4 shadow-sm border-4 border-slate-800 min-h-[640px]'
              : 'max-w-4xl bg-white rounded-xl p-6 shadow-md border border-slate-200'
          }`}
        >
          {viewType === 'card' ? (
            /* CATALOG CARD VIEW - Single authentic preview card without confusion or duplication */
            <div className="flex flex-col items-center justify-center w-full py-2">
              <div className="text-center mb-3">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-4 py-1 rounded-full border border-slate-200">
                  Предпросмотр карточки в каталоге ({viewport === 'mobile' ? 'Мобильный вид' : 'Стандартный вид'})
                </span>
              </div>
              <div className={`bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:shadow-lg transition-all flex flex-col h-full w-full ${viewport === 'mobile' ? 'max-w-sm' : 'max-w-sm sm:max-w-md'}`}>
                {/* Product Card Image */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-50 border border-slate-100 mb-4 group">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {badge && (
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-amber-500 text-slate-900 font-bold text-[11px] rounded-md shadow-sm">
                      {badge}
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] rounded backdrop-blur-sm">
                    {brand}
                  </div>
                </div>

                {/* Title and Category */}
                <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  {product.categoryLabel || product.category || (isSoftware ? 'CAD/CAM' : 'КИМ')}
                </div>
                <h4 className="text-base font-bold text-slate-900 line-clamp-2 mb-2 leading-snug">
                  {name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                  {shortDesc}
                </p>

                {/* Specs Pills */}
                {Object.keys(specs).length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 mb-4 text-[11px]">
                    {Object.entries(specs).slice(0, 4).map(([k, v]) => (
                      <div key={k} className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[10px] truncate">{k}</span>
                        <span className="font-semibold text-slate-800 truncate block">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Price & Buttons */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400">Ориентировочная цена</div>
                    <div className="text-sm font-bold text-slate-900">{price}</div>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Запросить КП
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* FULL PRODUCT DETAIL VIEW */
            <div className="space-y-6 text-slate-800">
              {/* Header Info */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>Каталог</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{isSoftware ? 'Программное обеспечение' : 'Оборудование'}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-900 font-medium truncate">{name}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                      {brand} {product.specs?.['Страна'] ? `• ${product.specs['Страна']}` : ''}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">{name}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Стоимость поставки</span>
                    <span className="text-lg sm:text-xl font-extrabold text-blue-700">{price}</span>
                  </div>
                </div>
              </div>

              {/* Product Hero Area */}
              <div className={`grid gap-6 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-12'}`}>
                {/* Image & Gallery */}
                <div className={viewport === 'mobile' ? 'w-full' : 'xl:col-span-5'}>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-2 relative flex items-center justify-center">
                    <img
                      src={galleryList[selectedGalleryIdx] || image}
                      alt={name}
                      className="w-full h-full object-contain"
                    />
                    {badge && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-slate-900 text-xs font-bold px-2.5 py-1 rounded shadow">
                        {badge}
                      </span>
                    )}
                  </div>

                  {galleryList.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                      {galleryList.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedGalleryIdx(idx)}
                          className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 bg-slate-50 ${
                            selectedGalleryIdx === idx ? 'border-blue-600 shadow' : 'border-slate-200 opacity-70'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-contain p-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description and Key Benefits */}
                <div className={viewport === 'mobile' ? 'w-full' : 'xl:col-span-7'}>
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
                    <p>{fullDesc}</p>
                  </div>

                  {features.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Преимущества и ключевые функции
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
                    >
                      Запросить технико-коммерческое предложение
                    </button>
                    {product.brochureUrl && (
                      <button
                        type="button"
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Скачать брошюру (PDF)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Specifications Table */}
              {Object.keys(specs).length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    Технические характеристики
                  </h4>
                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        {Object.entries(specs).map(([label, val], idx) => (
                          <tr key={label} className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}>
                            <td className="py-2 px-4 font-medium text-slate-500 border-r border-slate-100 w-1/2 sm:w-2/5">
                              {label}
                            </td>
                            <td className="py-2 px-4 font-semibold text-slate-900">
                              {String(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* System Requirements Table */}
              {isSoftware && product.sysReqs && Object.keys(product.sysReqs).length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    Рекомендуемые системные требования
                  </h4>
                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        {Object.entries(product.sysReqs).map(([label, val], idx) => (
                          <tr key={label} className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}>
                            <td className="py-2 px-4 font-medium text-slate-500 border-r border-slate-100 w-1/2 sm:w-2/5">
                              {label}
                            </td>
                            <td className="py-2 px-4 font-semibold text-slate-900">
                              {String(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
