import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  SlidersHorizontal,
  Download,
  Globe,
  ExternalLink,
  Check,
  Play,
  Layers,
  ShieldCheck,
  Cpu,
  Award,
  ArrowRight,
  Table as TableIcon,
  Printer,
  Share2,
  PhoneCall,
  Mail,
  FileCheck,
  Wrench,
  Info,
  X,
  Link2,
  Gauge,
  TrendingUp
} from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { copyToClipboard } from '../../utils/clipboard';
import {
  PRODUCTS_DATA,
  TOPSOLID_OFFICIAL_LINKS,
  POLYWORKS_EDITIONS_MATRIX,
  POLYWORKS_EDITION_DETAILS,
} from '../../data/mockData';
import { FeatureList } from './FeatureList';
import { ProductFaqSection } from './ProductFaqSection';
import { TopSolidModulesExplorer } from '../software/TopSolidModulesExplorer';
import { generatePrintableHTML } from '../../utils/printProductSpec';
import { ProductSpecPrintOverlay } from './ProductSpecPrintOverlay';

export interface ProductDetailLayoutProps {
  product: Product;
  onBack?: () => void;
}

export const ProductDetailLayout: React.FC<ProductDetailLayoutProps> = ({
  product,
  onBack,
}) => {
  const {
    navigateTo,
    addToCompare,
    removeFromCompare,
    isInCompare,
    openContactModal,
    openConfiguratorModal,
    openRoiCalculatorModal,
    showToast,
  } = useApp();

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedPolyworksEdition, setSelectedPolyworksEdition] = useState<string>('premium');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Gallery items list
  const imagesList = useMemo(() => {
    return [product.image, ...(product.gallery || [])].filter(Boolean);
  }, [product.image, product.gallery]);

  // Handle back navigation
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      if (product.type === 'software') {
        navigateTo('software', product.category || undefined);
      } else {
        navigateTo('hardware', product.category || undefined);
      }
    }
  };

  // Compare toggle
  const isCompared = isInCompare(product.id);
  const handleToggleCompare = () => {
    if (isCompared) {
      removeFromCompare(product.id);
      showToast(`«${product.name}» удален из списка сравнения`);
    } else {
      addToCompare(product);
      showToast(`«${product.name}» добавлен в сравнение`);
    }
  };

  // Copy link state and handler
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    const canonicalPath = product.type === 'software' ? `/software/${product.id}` : `/hardware/${product.id}`;
    let url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url || !url.includes(product.id)) {
      url = typeof window !== 'undefined' ? `${window.location.origin}${canonicalPath}` : canonicalPath;
    }

    await copyToClipboard(url);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2500);
    showToast('Ссылка на товар скопирована в буфер обмена');
  };

  const handleShare = handleCopyLink;

  // Print direct
  const handlePrintDirectWindow = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintableHTML(product));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  // Download HTML Specification
  const handleDownloadHTML = () => {
    const htmlContent = generatePrintableHTML(product);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Specification_${product.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Паспорт изделия сохранен в формате HTML');
  };

  // Dedicated engineer contact by product family
  const specialist = useMemo(() => {
    const pId = product.id.toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    if (pId.includes('topsolid')) {
      return {
        role: 'Ведущий инженер CAD/CAM (TopSolid 7)',
        name: 'Скобелев Александр Сергеевич',
        phone: '+7 (937) 984-61-51',
        phoneClean: '+79379846151',
        email: 'topsolid@ds-enginering.ru',
      };
    }
    if (pId.includes('polyworks')) {
      return {
        role: 'Главный метролог и специалист по PolyWorks',
        name: 'Некрасов Сергей',
        phone: '+7 (927) 719-06-97',
        phoneClean: '+79277190697',
        email: 's.nekrasov@ds-enginering.ru',
      };
    }
    return {
      role: 'Ведущий специалист по измерительному оборудованию и КИМ',
      name: 'Ярыш Александр Владимирович',
      phone: '+7 (927) 719-06-97',
      phoneClean: '+79277190697',
      email: 'a.yarish@ds-enginering.ru',
    };
  }, [product.id, product.brand]);

  // Related products (cross-category intelligence)
  const relatedProducts = useMemo(() => {
    if (product.type === 'software') {
      // Find matching hardware (e.g. КИМ, scan arms, 3D-scanners) + 1 sibling software
      const hwRecs = PRODUCTS_DATA.filter((p) => p.type === 'hardware').slice(0, 2);
      const swSibling = PRODUCTS_DATA.filter((p) => p.type === 'software' && p.id !== product.id).slice(0, 1);
      return [...hwRecs, ...swSibling];
    } else {
      // Hardware: find matching software (PolyWorks, Geomagic, Shining3D Inspect) + 1 sibling hardware
      const swRecs = PRODUCTS_DATA.filter((p) => p.type === 'software').slice(0, 2);
      const hwSibling = PRODUCTS_DATA.filter((p) => p.type === 'hardware' && p.id !== product.id && p.category === product.category).slice(0, 1);
      const fallbackHw = PRODUCTS_DATA.filter((p) => p.type === 'hardware' && p.id !== product.id).slice(0, 1);
      return [...swRecs, ...(hwSibling.length > 0 ? hwSibling : fallbackHw)];
    }
  }, [product.id, product.type, product.category]);

  const isDualSpecs = Boolean(product.dualModeSpecs);

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 2. UNIFIED TOP CONTROLS & ACTIONS BAR                                     */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          title="Вернуться в каталог"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Назад в каталог</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Brand & Category Badge */}
          <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-900/60">
            {product.brand} • {product.categoryLabel || product.category}
          </span>

          {/* Verification Status Chip */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {product.type === 'software'
                ? 'Официальные лицензии'
                : 'Госреестр СИ / Поверка'}
            </span>
          </span>

          {/* Compare Button */}
          <button
            onClick={handleToggleCompare}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isCompared
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Сравнить характеристики"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isCompared ? 'В сравнении' : 'Сравнить'}</span>
          </button>

          {/* Print Specification Modal Trigger */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Печать спецификации / Сохранить в PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Печать / PDF</span>
          </button>

          {/* Copy Link Button */}
          <button
            id="copy-link-btn"
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isCopied
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
            title="Скопировать ссылку на страницу"
            aria-label="Скопировать ссылку на страницу"
            data-testid="copy-link-button"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            )}
            <span>{isCopied ? 'Скопировано!' : 'Скопировать ссылку'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. UNIFIED TWO-COLUMN PRODUCT SHOWCASE HERO CARD                          */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: Media Gallery, CTAs, Official Resources & Specialist     */}
          {/* --------------------------------------------------------------------- */}
          <div className="xl:col-span-5 space-y-4 min-w-0">
            {/* Media Viewer Frame */}
            <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 aspect-4/3 flex items-center justify-center shadow-inner group">
              {showVideo && product.videoUrl ? (
                <iframe
                  src={product.videoUrl}
                  title={product.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Product Badge */}
              {product.badge && (
                <span className="absolute top-3 left-3 px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                  {product.badge}
                </span>
              )}

              {/* Video Toggle Button */}
              {product.videoUrl && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="absolute bottom-3 right-3 px-4 py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold rounded-xl backdrop-blur-md flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{showVideo ? 'Показать фото' : 'Смотреть видео'}</span>
                </button>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(img);
                      setShowVideo(false);
                    }}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImage === img && !showVideo
                        ? 'border-blue-600 scale-105 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() =>
                    openContactModal({
                      title: `Заказ онлайн-демонстрации: ${product.name}`,
                      defaultProduct: product.name,
                      formType: 'demo',
                    })
                  }
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white shrink-0" />
                  <span>Заказать онлайн-демо</span>
                </button>

                <button
                  onClick={() =>
                    openContactModal({
                      title: `Запрос коммерческого предложения: ${product.name}`,
                      defaultProduct: product.name,
                      formType: 'quote',
                    })
                  }
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Запросить КП / Расчет</span>
                </button>
              </div>

              {/* Brochure / Passport Button */}
              {product.brochureUrl ? (
                <a
                  href={product.brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать официальную брошюру (PDF)</span>
                </a>
              ) : (
                <button
                  onClick={() =>
                    openContactModal({
                      title: `Запрос брошюры и спецификации: ${product.name}`,
                      defaultProduct: product.name,
                      formType: 'brochure',
                    })
                  }
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Запросить технический паспорт и брошюру</span>
                </button>
              )}

              {/* Copy Link Button */}
              <button
                id="copy-link-cta"
                onClick={handleCopyLink}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isCopied
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
                title="Скопировать ссылку на товар"
                aria-label="Скопировать ссылку на товар"
                data-testid="copy-link-cta-button"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Скопировать ссылку на товар</span>
                  </>
                )}
              </button>

              {/* Direct Metrology Configurator & ROI Calculator Buttons */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <button
                  type="button"
                  onClick={openConfiguratorModal}
                  className="w-full py-2.5 px-4 bg-blue-50/90 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-xs border border-blue-200 dark:border-blue-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Метрологический конфигуратор оборудования СИ</span>
                </button>

                <button
                  type="button"
                  onClick={openRoiCalculatorModal}
                  className="w-full py-2.5 px-4 bg-amber-50/90 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold rounded-xl text-xs border border-amber-300/70 dark:border-amber-800/70 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Калькулятор окупаемости внедрения СИ (ROI)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-400/40">
                    Beta
                  </span>
                </button>
              </div>
            </div>

            {/* Official Developer / Manufacturer Resources Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Официальный статус и ресурсы:</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-300 flex items-center justify-between">
                <span>Производитель:</span>
                <span className="font-bold text-slate-900 dark:text-white">{product.brand}</span>
              </div>

              {product.id === 'topsolid-7' && (
                <a
                  href={TOPSOLID_OFFICIAL_LINKS.officialSite}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:border-blue-400 font-semibold text-xs transition-all shadow-2xs group"
                >
                  <span>Портал TOPSOLID SAS (Франция)</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </a>
              )}

              {product.officialUrl && product.id !== 'topsolid-7' && (
                <a
                  href={product.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:border-blue-400 font-semibold text-xs transition-all shadow-2xs group"
                >
                  <span className="truncate">Международный портал {product.brand}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2 group-hover:scale-110 transition-transform" />
                </a>
              )}
            </div>

            {/* Dedicated Lead Specialist Card */}
            <div className="bg-blue-50/80 dark:bg-slate-800/90 border border-blue-200/80 dark:border-blue-900/60 p-4 rounded-xl space-y-2 text-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{specialist.role}:</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{specialist.name}</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                <a
                  href={`tel:${specialist.phoneClean}`}
                  className="text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5 font-semibold"
                >
                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                  <span>{specialist.phone}</span>
                </a>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-500">•</span>
                <a
                  href={`mailto:${specialist.email}`}
                  className="text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5 font-semibold"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{specialist.email}</span>
                </a>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: Title, Descriptions, Specs Table, Deliverables & Docs   */}
          {/* --------------------------------------------------------------------- */}
          <div className="xl:col-span-7 space-y-6 min-w-0">
            {/* Header / Brand / Category */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{product.brand}</span>
                <span>•</span>
                <span>{product.categoryLabel || product.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-3 leading-relaxed">
                {product.fullDescription || product.shortDescription}
              </p>

              {/* Metrology & Regulatory Compliance Banner */}
              <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
                  <Award className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <span className="font-bold">Метрологический учет и стандарты:</span>
                    <span className="text-slate-500 dark:text-slate-300 ml-1">
                      {product.type === 'software'
                        ? 'Сертификация алгоритмов PTB Class 1, адаптация под ЕСКД/ЕСТД'
                        : 'Внесено в Госреестр СИ / Протокол поверки по ГОСТ Р 8.736-2011'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://fgis.gost.ru/fundmetrology/registry/4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-50 font-semibold text-[11px] shadow-2xs transition-colors"
                    title="Проверить в Государственном реестре средств измерений"
                  >
                    <span>ФГИС «АРШИН»</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://pub.fsa.gov.ru/rds/declaration"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold text-[11px] shadow-2xs transition-colors"
                    title="Проверить сертификат / декларацию ЕАЭС"
                  >
                    <span>Реестр ЕАЭС</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Technical Specifications Section */}
            {isDualSpecs && product.dualModeSpecs ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Технические характеристики:</span>
                  </h3>
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Печать / Спецификация</span>
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto no-scrollbar shadow-xs bg-white dark:bg-slate-900 text-xs print-avoid-break">
                  <table className="product-spec-table min-w-[600px] w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white divide-x divide-slate-700">
                        <th className="py-3 px-4 font-bold w-1/3">Характеристика / Параметр</th>
                        <th className="py-3 px-4 font-bold text-center w-1/3 bg-blue-950/80">
                          {product.dualModeSpecs.modeTitle1 || 'Лазерное сканирование'}
                        </th>
                        <th className="py-3 px-4 font-bold text-center w-1/3 bg-slate-900">
                          {product.dualModeSpecs.modeTitle2 || 'Инфракрасное сканирование (VCSEL)'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {product.dualModeSpecs.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            idx % 2 === 0
                              ? 'bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
                              : 'bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/60'
                          }
                        >
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800">
                            {row.label}
                          </td>
                          {row.singleVal ? (
                            <td colSpan={2} className="py-2.5 px-4 text-slate-900 dark:text-white font-medium text-center bg-blue-50/30 dark:bg-blue-950/20">
                              {row.singleVal}
                            </td>
                          ) : (
                            <>
                              <td className="py-2.5 px-4 text-slate-900 dark:text-white font-mono text-center border-r border-slate-200 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/10">
                                {row.laserVal || '—'}
                              </td>
                              <td className="py-2.5 px-4 text-slate-900 dark:text-white font-mono text-center bg-slate-100/50 dark:bg-slate-800/50">
                                {row.irVal || '—'}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footnotes */}
                {product.dualModeSpecs.footnotes && product.dualModeSpecs.footnotes.length > 0 && (
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-3 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                    {product.dualModeSpecs.footnotes.map((note, i) => (
                      <p key={i} className="leading-relaxed flex items-start gap-1.5">
                        <span className="font-bold shrink-0">•</span>
                        <span>{note}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : product.specs && Object.keys(product.specs).length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Технические характеристики:</span>
                  </h3>
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Печать / Спецификация</span>
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto no-scrollbar text-xs shadow-xs bg-white dark:bg-slate-900 print-avoid-break">
                  <table className="product-spec-table min-w-[400px] sm:w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {Object.entries(product.specs).map(([label, val], idx) => (
                        <tr
                          key={label}
                          className={
                            idx % 2 === 0
                              ? 'bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/80'
                              : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                          }
                        >
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200 w-2/5 border-r border-slate-200 dark:border-slate-800 break-words">
                            {label}
                          </td>
                          <td className="py-2.5 px-4 text-slate-900 dark:text-white font-mono break-words">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* System Requirements Card (for Scanner or Software) */}
            {(product.dualModeSpecs?.systemReqs || product.sysReqs) && (
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs space-y-2 border border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-blue-400 uppercase tracking-wider text-[11px]">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>Рекомендуемая конфигурация ПК / Системные требования:</span>
                </div>
                {(() => {
                  const reqs = product.dualModeSpecs?.systemReqs || (product.sysReqs as any);
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 pt-1 text-[11px]">
                      {reqs.os && (
                        <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">Операционная система:</span>
                          <span className="font-medium text-white">{reqs.os}</span>
                        </div>
                      )}
                      {reqs.gpu && (
                        <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">Графика (GPU):</span>
                          <span className="font-medium text-white">{reqs.gpu}</span>
                        </div>
                      )}
                      {reqs.vram && (
                        <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">Видеопамять:</span>
                          <span className="font-medium text-white">{reqs.vram}</span>
                        </div>
                      )}
                      {reqs.cpu && (
                        <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">Процессор (CPU):</span>
                          <span className="font-medium text-white">{reqs.cpu}</span>
                        </div>
                      )}
                      {reqs.ram && (
                        <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 sm:col-span-2 xl:col-span-2">
                          <span className="text-slate-400 block text-[10px]">Оперативная память (RAM):</span>
                          <span className="font-medium text-white">{reqs.ram}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Key Features & Scope of Delivery */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Преимущества и комплектация:
                </h3>
                <FeatureList features={product.features} />
              </div>
            )}

            {/* Technical Documentation & Downloads */}
            {product.downloads && product.downloads.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Техническая документация:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.downloads.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 hover:shadow-md rounded-xl transition-all group"
                      title={`Скачать ${doc.title}`}
                    >
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wide">
                          {doc.type || 'PDF'} • {doc.size || '1.2 MB'}
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-1 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SPECIALIZED EXTENSION: TOPSOLID 7 MODULES EXPLORER                     */}
      {/* ========================================================================= */}
      {product.id === 'topsolid-7' && (
        <div className="space-y-6">
          <TopSolidModulesExplorer />

          <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm border border-blue-800/40 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Комплексные инженерные услуги TopSolid</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Разработка постпроцессоров и верификация ЧПУ-станочных комплексов
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
              Инжиниринговый центр «ДС-Инжиниринг» разрабатывает кинематические 3D-модели станков с ЧПУ, верифицирует расчет траекторий на реальном G-коде и внедряет PDM-системы управления конструкторско-технологической документацией на машиностроительных предприятиях РФ.
            </p>

            <div className="pt-3 flex items-center justify-between flex-wrap gap-4 border-t border-white/10 text-xs">
              <div className="text-slate-300">
                Специалист по направлению TopSolid: <strong className="text-white">Скобелев Александр Сергеевич</strong> (+7 937 984-61-51)
              </div>
              <button
                onClick={() =>
                  openContactModal({
                    title: 'Запрос разработки постпроцессора / внедрения TopSolid 7',
                    defaultProduct: 'TopSolid 7',
                    formType: 'consult',
                  })
                }
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Обсудить проект с инженером
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SPECIALIZED EXTENSION: POLYWORKS EDITIONS MATRIX & PTB CERTIFICATION   */}
      {/* ========================================================================= */}
      {product.id === 'polyworks-inspector' && (
        <section id="polyworks-matrix" className="bg-slate-900 text-white rounded-xl p-5 sm:p-8 shadow-sm border border-emerald-900/40 space-y-6 scroll-mt-24">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Сравнение редакций PolyWorks|Inspector™
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Подбор комплектации под ваш парк измерительного оборудования
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Выберите оптимальную редакцию PolyWorks|Inspector в зависимости от типа используемых приборов (руки, сканеры, КИМ или оптические трекеры). Нажмите на любую редакцию или столбец таблицы для детального сравнения.
            </p>
          </div>

          {/* Edition Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {POLYWORKS_EDITION_DETAILS.map((ed) => {
              const isSelected = selectedPolyworksEdition === ed.id;
              return (
                <button
                  key={ed.id}
                  onClick={() => setSelectedPolyworksEdition(ed.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/90 border-emerald-400 text-white shadow-sm ring-2 ring-emerald-400/60 scale-[1.02]'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1.5 inline-block ${
                        isSelected ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {ed.badge}
                    </span>
                    <div className="font-extrabold text-xs sm:text-sm text-white">{ed.name}</div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Активный выбор</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Selected Edition Profile Card */}
          {(() => {
            const activeEd =
              POLYWORKS_EDITION_DETAILS.find((ed) => ed.id === selectedPolyworksEdition) ||
              POLYWORKS_EDITION_DETAILS[0];
            return (
              <div className="bg-slate-800/80 border border-emerald-500/40 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm sm:text-base text-white">
                        {activeEd.name}
                      </div>
                      <div className="text-xs text-emerald-400 font-medium">
                        {activeEd.badge}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs px-4 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg">
                    Столбец в таблице подсвечен
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeEd.summary}
                </p>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <strong className="text-emerald-300">Целевое применение: </strong>
                  {activeEd.target}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {activeEd.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Matrix Table with Dynamic Column Highlighting */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden shadow-lg overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-slate-200 border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-700">
                  <th className="p-3.5 font-bold text-slate-300 w-2/5 sticky left-0 bg-slate-900 z-10 shadow-[2px_0_6px_rgba(0,0,0,0.3)]">
                    Функциональная возможность
                  </th>
                  {[
                    { id: 'premium', label: 'PREMIUM', color: 'emerald' },
                    { id: 'standard', label: 'STANDARD', color: 'blue' },
                    { id: 'probingPlus', label: 'PROBING++', color: 'amber' },
                    { id: 'probing', label: 'PROBING', color: 'teal' },
                    { id: 'gauging', label: 'GAUGING', color: 'slate' },
                  ].map((col) => {
                    const isColActive = selectedPolyworksEdition === col.id;
                    return (
                      <th
                        key={col.id}
                        onClick={() => setSelectedPolyworksEdition(col.id)}
                        className={`p-3.5 font-bold text-center border-l transition-all cursor-pointer ${
                          isColActive
                            ? 'bg-emerald-600/40 text-emerald-200 border-x-2 border-emerald-400 font-black shadow-inner'
                            : 'text-slate-300 border-slate-700 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span>{col.label}</span>
                          {isColActive && (
                            <span className="text-[9px] text-emerald-300 uppercase tracking-wider font-semibold mt-0.5">
                              Выбрано
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {POLYWORKS_EDITIONS_MATRIX.map((row, idx) => {
                  const getVal = (colId: string) => {
                    switch (colId) {
                      case 'premium':
                        return row.premium;
                      case 'standard':
                        return row.standard;
                      case 'probingPlus':
                        return row.probingPlus;
                      case 'probing':
                        return row.probing;
                      case 'gauging':
                        return row.gauging;
                      default:
                        return false;
                    }
                  };

                  return (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0
                          ? 'bg-slate-800/40 hover:bg-slate-800/70'
                          : 'bg-slate-800/20 hover:bg-slate-800/50'
                      }
                    >
                      <td className="p-3 text-slate-200 font-medium sticky left-0 bg-slate-900/95 z-10 border-r border-slate-700 shadow-[2px_0_6px_rgba(0,0,0,0.2)]">
                        {row.feature}
                      </td>
                      {['premium', 'standard', 'probingPlus', 'probing', 'gauging'].map((colId) => {
                        const val = getVal(colId);
                        const isColActive = selectedPolyworksEdition === colId;
                        return (
                          <td
                            key={colId}
                            onClick={() => setSelectedPolyworksEdition(colId)}
                            className={`p-3 text-center border-l border-slate-700 cursor-pointer transition-colors ${
                              isColActive
                                ? 'bg-emerald-500/20 border-x-2 border-emerald-400/80 font-bold'
                                : 'hover:bg-slate-800/60'
                            }`}
                          >
                            {val ? (
                              <span className="inline-flex p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="text-slate-500 font-bold">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE PRODUCT FAQ ACCORDION                                      */}
      {/* ========================================================================= */}
      <ProductFaqSection
        product={product}
        title={`Частые вопросы о ${product.name}`}
        subtitle="Технические разъяснения экспертов ДС-Инжиниринг по внедрению, совместимости, поверке и обучению"
        onAskQuestion={() =>
          openContactModal({
            title: `Вопрос инженеру по ${product.name}`,
            defaultProduct: product.name,
            formType: 'consult',
          })
        }
      />

      {/* ========================================================================= */}
      {/* 7. RELATED PRODUCTS SECTION ("С этим продуктом также выбирают")           */}
      {/* ========================================================================= */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {product.type === 'software'
                  ? 'Совместимое измерительное оборудование'
                  : 'Рекомендуемое программное обеспечение и аксессуары'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Готовые метрологические комплексы и инструменты, проверенные инженерами ДС-Инжиниринг
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigateTo(rel.type === 'software' ? 'software' : 'hardware', rel.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {rel.brand} • {rel.categoryLabel || rel.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {rel.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {rel.shortDescription || rel.fullDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Подробнее</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {rel.type === 'software' ? 'ПО' : 'Оборудование'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 8. BOTTOM CONSULTATION CTA BANNER                                         */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Нужна помощь в подборе комплектации или расчет проекта?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Инженеры центра «ДС-Инжиниринг» проведут сравнительный анализ, рассчитают срок окупаемости и организуют выездной тест или демонстрацию оборудования на ваших образцах.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
          <a
            href={`tel:${specialist.phoneClean}`}
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm text-center transition-colors flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>{specialist.phone}</span>
          </a>
          <button
            onClick={() =>
              openContactModal({
                title: `Консультация по продукту ${product.name}`,
                defaultProduct: product.name,
                formType: 'consult',
              })
            }
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm text-center shadow-lg transition-colors cursor-pointer"
          >
            Заказать расчет проекта
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. PRINT SPECIFICATION OVERLAY (CSS A4 PAGINATION & READABILITY ENGINE)   */}
      {/* ========================================================================= */}
      <ProductSpecPrintOverlay
        product={product}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
