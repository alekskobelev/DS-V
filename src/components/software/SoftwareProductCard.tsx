import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, SlidersHorizontal, Download, ArrowRight, Sparkles, ShieldCheck, Cpu, Workflow, Eye, Link2 } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { copyToClipboard } from '../../utils/clipboard';

interface SoftwareProductCardProps {
  product: Product;
  onOpenDetail?: (prod: Product) => void;
}

export const SoftwareProductCard: React.FC<SoftwareProductCardProps> = ({
  product,
  onOpenDetail,
}) => {
  const { navigateTo, addToCompare, isInCompare, openContactModal, showToast } = useApp();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? `${window.location.origin}/software/${product.id}` : `/software/${product.id}`;
    await copyToClipboard(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    showToast('Copied!');
  };

  const handleCardClick = () => {
    if (onOpenDetail) {
      onOpenDetail(product);
    } else {
      navigateTo('software', product.id);
    }
  };

  // Determine engineering category direction badge
  const getDirectionBadge = () => {
    const id = product.id.toLowerCase();
    
    // TopSolid 7
    if (id.includes('topsolid')) {
      return { label: 'Сквозная CAD / CAM / PDM', icon: Cpu, color: 'bg-blue-600 text-white' };
    }
    // PolyWorks
    if (id.includes('polyworks')) {
      return { label: '3D-Метрология и КИМ', icon: ShieldCheck, color: 'bg-emerald-600 text-white' };
    }
    // Geomagic Control X (Automated Quality Control / GD&T inspection)
    if (id.includes('control-x')) {
      return { label: 'Контроль точности и GD&T', icon: ShieldCheck, color: 'bg-indigo-600 text-white' };
    }
    // Shining 3D Inspect
    if (id.includes('inspect')) {
      return { label: 'Метрологический 3D-контроль', icon: ShieldCheck, color: 'bg-indigo-600 text-white' };
    }
    // Shining 3D FreeScan software
    if (id.includes('freescan')) {
      return { label: '3D-Сканирование', icon: Eye, color: 'bg-sky-600 text-white' };
    }
    // Reverse Engineering: Geomagic Design X & Shining 3D EXModel
    if (id.includes('design-x') || id.includes('exmodel')) {
      return { label: 'Реверс-инжиниринг', icon: Workflow, color: 'bg-amber-600 text-white' };
    }
    
    return { label: product.categoryLabel || 'Инженерное ПО', icon: Cpu, color: 'bg-blue-600 text-white' };
  };

  const direction = getDirectionBadge();
  const DirectionIcon = direction.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between group"
    >
      {/* Top Image Preview Container */}
      <div
        className="relative cursor-pointer overflow-hidden aspect-16/10 bg-slate-100 dark:bg-slate-800"
        onClick={handleCardClick}
      >
        <img
          src={product.image}
          alt={`${product.name} — ${product.categoryLabel || 'Промышленное ПО'} ${product.brand} от ДС-Инжиниринг`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <span className="text-white text-xs font-semibold flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>Открыть полный обзор и модули</span>
          </span>
        </div>

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md shadow-xs flex items-center gap-1.5 pointer-events-auto ${direction.color}`}>
            <DirectionIcon className="w-3 h-3" />
            <span>{direction.label}</span>
          </span>
          <span className="px-2.5 py-1 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs text-slate-850 dark:text-slate-200 text-[10px] font-bold rounded-md border border-slate-200 dark:border-slate-700 shrink-0 pointer-events-auto shadow-xs">
            {product.brand}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {product.categoryLabel || 'Промышленный комплекс'}
            </span>
            {product.badge && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold rounded border border-blue-200 dark:border-blue-800">
                {product.badge}
              </span>
            )}
          </div>

          <h3
            onClick={handleCardClick}
            className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Key Tasks / Features */}
          {product.features && product.features.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Ключевые возможности:
              </div>
              {product.features.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Modules preview if present */}
          {product.specs && product.specs['Интегрированные модули'] && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Модули системы:
              </div>
              <div className="flex flex-wrap gap-1">
                {product.specs['Интегрированные модули']
                  .split(', ')
                  .slice(0, 4)
                  .map((mod) => (
                    <span
                      key={mod}
                      className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded border border-slate-200 dark:border-slate-700"
                    >
                      {mod}
                    </span>
                  ))}
                {product.specs['Интегрированные модули'].split(', ').length > 4 && (
                  <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold rounded border border-blue-100 dark:border-blue-900/40">
                    +{product.specs['Интегрированные модули'].split(', ').length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={handleCardClick}
              className="flex-1 py-2.5 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors text-center shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Подробнее</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                openContactModal({
                  title: `Запрос демонстрации и тестирования: ${product.name}`,
                  defaultProduct: product.name,
                  formType: 'demo',
                })
              }
              className="py-2.5 px-3 sm:px-4 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-xs border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer text-center whitespace-nowrap"
              title="Заказать демонстрацию на ваших деталях"
            >
              Демо-доступ
            </button>
          </div>

          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() =>
                openContactModal({
                  title: `Запрос коммерческого предложения: ${product.name}`,
                  defaultProduct: product.name,
                  formType: 'quote',
                })
              }
              className="py-2.5 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              title="Запросить расчет стоимости лицензий"
            >
              КП
            </button>
            <button
              onClick={() => addToCompare(product)}
              className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                isInCompare(product.id)
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Добавить в сравнение"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                isCopied
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-600'
                  : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Copy link / Скопировать ссылку на товар"
              aria-label="Copy link"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
