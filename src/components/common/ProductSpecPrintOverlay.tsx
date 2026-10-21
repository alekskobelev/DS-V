import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  X,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  ShieldCheck,
  Cpu,
  FileCheck2,
  Layers,
  Info,
  Calendar,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../../types';
import { generatePrintableHTML } from '../../utils/printProductSpec';

export interface ProductSpecPrintOverlayProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductSpecPrintOverlay: React.FC<ProductSpecPrintOverlayProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);
  const [showSystemReqs, setShowSystemReqs] = useState(true);
  const [showFeatures, setShowFeatures] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const isDual = Boolean(product.dualModeSpecs);
  const hasSysReqs = Boolean(product.dualModeSpecs?.systemReqs || product.sysReqs);
  const hasFeatures = Boolean(product.features && product.features.length > 0);

  // Keyboard shortcut listener: ESC to close, Ctrl+P to print
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('product-spec-overlay-active');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('product-spec-overlay-active');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    try {
      const htmlContent = generatePrintableHTML(product);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Паспорт_${(product.name || 'ДС-Инжиниринг').replace(/\s+/g, '_')}_A4.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка сохранения спецификации:', err);
    }
  };

  const handleCopyTableTsv = async () => {
    try {
      let tsvText = '';

      if (isDual && product.dualModeSpecs) {
        tsvText += `Параметр\t${product.dualModeSpecs.modeTitle1 || 'Режим 1'}\t${product.dualModeSpecs.modeTitle2 || 'Режим 2'}\n`;
        product.dualModeSpecs.rows.forEach(r => {
          if (r.singleVal) {
            tsvText += `${r.label}\t${r.singleVal}\t${r.singleVal}\n`;
          } else {
            tsvText += `${r.label}\t${r.laserVal || '—'}\t${r.irVal || '—'}\n`;
          }
        });
      } else if (product.specs) {
        tsvText += `Параметр\tМетрологическое значение\n`;
        Object.entries(product.specs).forEach(([k, v]) => {
          tsvText += `${k}\t${v}\n`;
        });
      }

      await navigator.clipboard.writeText(tsvText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const formattedDate = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const passportNumber = `ТП-2026/${product.id.toUpperCase()}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Технический паспорт и спецификация: ${product.name}`}
      className="product-spec-print-overlay fixed inset-0 z-[450] flex flex-col bg-slate-950/80 backdrop-blur-xs overflow-hidden"
    >
      {/* ===================================================================== */}
      {/* 1. SCREEN TOOLBAR (Hidden during print)                              */}
      {/* ===================================================================== */}
      <header className="print-overlay-toolbar shrink-0 bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-md z-10 print:hidden select-none">
        {/* Left info badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400">
            <Printer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                Печатная спецификация A4
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 rounded">
                ISO 210×297 мм
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {product.name} • {product.brand}
            </p>
          </div>
        </div>

        {/* Center zoom & layout controls */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-700/80 text-xs">
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.7, Number((z - 0.1).toFixed(1))))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
            title="Уменьшить масштаб листа"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-14 text-center font-mono font-bold text-blue-300 text-[11px]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
            title="Увеличить масштаб листа"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={() => setZoom(1)}
            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded cursor-pointer transition-colors ${
              zoom === 1 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            100%
          </button>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          {/* Options Dropdown toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOptionsOpen(o => !o)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isOptionsOpen
                  ? 'bg-blue-600/30 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Настройка отображения разделов паспорта"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Разделы</span>
            </button>

            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 text-xs space-y-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="font-bold text-slate-300 text-[11px] pb-1 border-b border-slate-800">
                  Состав печатного документа
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showDescription}
                    onChange={e => setShowDescription(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Описание и назначение</span>
                </label>
                {hasFeatures && (
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={showFeatures}
                      onChange={e => setShowFeatures(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Комплектация и преимущества</span>
                  </label>
                )}
                {hasSysReqs && (
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={showSystemReqs}
                      onChange={e => setShowSystemReqs(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Требования к ПК / Workstation</span>
                  </label>
                )}
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showSignatures}
                    onChange={e => setShowSignatures(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Штамп ОТК и подписи</span>
                </label>
              </div>
            )}
          </div>

          {/* Copy Table TSV */}
          <button
            type="button"
            onClick={handleCopyTableTsv}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Скопировать таблицу в буфер для Excel / Таблиц"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>В Excel</span>
              </>
            )}
          </button>

          {/* Download HTML */}
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Сохранить автономный HTML файл спецификации"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>HTML</span>
          </button>

          {/* Primary Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            title="Печать листа A4 или сохранение в PDF (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать A4</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
            title="Закрыть предпросмотр (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. SHEET CONTAINER & SCROLL VIEWPORT                                 */}
      {/* ===================================================================== */}
      <main className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/90 print:p-0 print:m-0 print:bg-white print:overflow-visible">
        <div
          ref={sheetRef}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="product-spec-print-sheet transition-transform duration-150 ease-out bg-white text-slate-900 shadow-2xl rounded-xs print:rounded-none print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[15mm] flex flex-col justify-between box-border border border-slate-200 print:border-none print:p-0 print:m-0 print:max-w-none text-slate-900"
        >
          {/* Top Document Content */}
          <div className="space-y-4">
            {/* Header: Corporate logo & Metrology Authority */}
            <header className="border-b-2 border-blue-950 pb-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logos/manufacturers/ds_engineering.svg"
                  alt="ДС-Инжиниринг"
                  className="h-10 w-auto max-w-[170px] object-contain"
                  onError={(e) => {
                    // Fallback to text logo if SVG fails to load
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <div className="font-extrabold text-sm text-blue-950 tracking-tight uppercase">
                    ООО «ДС-Инжиниринг»
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    Инжиниринговый центр • 3D-метрология • Поставка оборудования • CAD/CAM
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-600 leading-tight">
                <div className="font-semibold text-slate-800">443063, г. Самара, ул. Свободы, 198</div>
                <div>Тел: +7 (846) 954-02-92, +7 (927) 748-46-58</div>
                <div>E-mail: info@ds-enginering.ru • www.ds-engineering.ru</div>
              </div>
            </header>

            {/* Document Title Banner */}
            <div className="bg-slate-100 border-y border-slate-300 px-3 py-2 flex items-center justify-between text-xs">
              <div className="font-extrabold text-blue-950 tracking-wide uppercase text-[11px]">
                Официальный технический паспорт и спецификация оборудования
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                № {passportNumber} • {formattedDate}
              </div>
            </div>

            {/* Product Identification Block */}
            <section className="print-heading-keep space-y-1.5 pt-1">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-black text-blue-950 tracking-tight">
                  {product.name}
                </h1>
                <div className="text-[10.5pt] text-slate-700 font-semibold">
                  Бренд / Производитель: <strong className="text-blue-950">{product.brand}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-slate-600 border-b border-slate-200 pb-2">
                <span>Категория: <strong>{product.categoryLabel || product.category}</strong></span>
                <span>•</span>
                <span>Артикул / Модель: <strong className="font-mono">{product.id}</strong></span>
                {product.specs?.['Гарантия'] && (
                  <>
                    <span>•</span>
                    <span>Гарантия: <strong>{product.specs['Гарантия']}</strong></span>
                  </>
                )}
                {product.specs?.['Статус в реестре СИ'] && (
                  <>
                    <span>•</span>
                    <span className="text-blue-900 font-bold">ФГИС «АРШИН»: {product.specs['Статус в реестре СИ']}</span>
                  </>
                )}
              </div>

              {showDescription && (
                <p className="text-[10.5pt] text-slate-700 leading-snug text-justify pt-1">
                  {product.fullDescription || product.shortDescription}
                </p>
              )}
            </section>

            {/* Technical Specifications Section & Table */}
            <section className="space-y-2 pt-2">
              <div className="print-heading-keep flex items-center justify-between">
                <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-700" />
                  <span>Метрологические и технические характеристики:</span>
                </h2>
                <div className="text-[9.5pt] text-slate-500 font-mono">
                  Стандарт: ГОСТ Р ИСО 10360 / VDI/VDE 2634
                </div>
              </div>

              {/* Table Container - Optimized for A4 printing and multi-page pagination */}
              <div className="border border-slate-300 rounded-xs overflow-hidden">
                <table className="product-spec-table w-full text-left border-collapse text-[10pt]">
                  <thead>
                    {isDual && product.dualModeSpecs ? (
                      <tr className="bg-slate-900 text-white font-bold text-[9.5pt]">
                        <th className="p-2 border border-slate-700 text-left w-2/5">
                          Характеристика / Измеряемый параметр
                        </th>
                        <th className="p-2 border border-slate-700 text-center bg-blue-950 text-blue-100 w-[30%]">
                          {product.dualModeSpecs.modeTitle1 || 'Режим 1 (Лазерный)'}
                        </th>
                        <th className="p-2 border border-slate-700 text-center bg-slate-900 text-slate-100 w-[30%]">
                          {product.dualModeSpecs.modeTitle2 || 'Режим 2 (Инфракрасный VCSEL)'}
                        </th>
                      </tr>
                    ) : (
                      <tr className="bg-slate-900 text-white font-bold text-[9.5pt]">
                        <th className="p-2 border border-slate-700 text-left w-2/5">
                          Наименование метрологического параметра
                        </th>
                        <th className="p-2 border border-slate-700 text-left w-3/5">
                          Нормированное техническое значение / Допуск
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {isDual && product.dualModeSpecs ? (
                      product.dualModeSpecs.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-slate-50/90' : 'bg-white'}
                        >
                          <td className="p-2 font-bold text-slate-900 border border-slate-300 align-top">
                            {row.label}
                          </td>
                          {row.singleVal ? (
                            <td
                              colSpan={2}
                              className="p-2 text-center font-mono font-medium text-slate-800 border border-slate-300 bg-slate-50/50"
                            >
                              {row.singleVal}
                            </td>
                          ) : (
                            <>
                              <td className="p-2 text-center font-mono font-bold text-blue-950 border border-slate-300 bg-blue-50/20">
                                {row.laserVal || '—'}
                              </td>
                              <td className="p-2 text-center font-mono font-medium text-slate-800 border border-slate-300 bg-slate-50/20">
                                {row.irVal || '—'}
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : product.specs && Object.keys(product.specs).length > 0 ? (
                      Object.entries(product.specs).map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? 'bg-slate-50/90' : 'bg-white'}
                        >
                          <td className="p-2 font-bold text-slate-900 border border-slate-300 w-2/5 align-top">
                            {key}
                          </td>
                          <td className="p-2 font-mono text-slate-800 border border-slate-300 w-3/5">
                            {val}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="p-3 text-center text-slate-500 italic">
                          Спецификация формируется по официальному запросу в инженерный отдел
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Metrological Footnotes & Calibration Protocol */}
            {isDual && product.dualModeSpecs?.footnotes && product.dualModeSpecs.footnotes.length > 0 && (
              <div className="print-avoid-break bg-slate-50 border border-slate-200 p-2.5 rounded-xs text-[9pt] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 uppercase text-[8.5pt]">
                  Метрологические примечания и условия поверки:
                </div>
                {product.dualModeSpecs.footnotes.map((fn, i) => (
                  <p key={i} className="leading-snug">
                    • {fn}
                  </p>
                ))}
              </div>
            )}

            {/* System Requirements / Workstation Configuration */}
            {showSystemReqs && hasSysReqs && (
              <section className="print-avoid-break space-y-1.5 pt-1">
                <h3 className="text-[10pt] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-700" />
                  <span>Рекомендуемая конфигурация рабочей станции (ПК):</span>
                </h3>
                {(() => {
                  const reqs = product.dualModeSpecs?.systemReqs || (product.sysReqs as any);
                  return (
                    <div className="border border-slate-300 rounded-xs bg-slate-50 p-2.5 grid grid-cols-3 gap-2 text-[9pt]">
                      {reqs.os && (
                        <div>
                          <span className="text-slate-500 block text-[8pt]">ОС:</span>
                          <strong className="text-slate-900">{reqs.os}</strong>
                        </div>
                      )}
                      {reqs.gpu && (
                        <div>
                          <span className="text-slate-500 block text-[8pt]">Графика (GPU):</span>
                          <strong className="text-slate-900">{reqs.gpu}</strong>
                        </div>
                      )}
                      {reqs.vram && (
                        <div>
                          <span className="text-slate-500 block text-[8pt]">Видеопамять:</span>
                          <strong className="text-slate-900">{reqs.vram}</strong>
                        </div>
                      )}
                      {reqs.cpu && (
                        <div>
                          <span className="text-slate-500 block text-[8pt]">Процессор (CPU):</span>
                          <strong className="text-slate-900">{reqs.cpu}</strong>
                        </div>
                      )}
                      {reqs.ram && (
                        <div className="col-span-2">
                          <span className="text-slate-500 block text-[8pt]">Оперативная память (RAM):</span>
                          <strong className="text-slate-900">{reqs.ram}</strong>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </section>
            )}

            {/* Scope of supply / Features */}
            {showFeatures && hasFeatures && (
              <section className="print-avoid-break space-y-1.5 pt-1">
                <h3 className="text-[10pt] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Базовая комплектация и возможности поставки:</span>
                </h3>
                <div className="border border-slate-200 bg-white p-2.5 rounded-xs">
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9pt] text-slate-700 list-disc list-inside">
                    {product.features.map((feat, i) => (
                      <li key={i} className="leading-snug">
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>

          {/* ================================================================= */}
          {/* Bottom Stamp, Signatures, and Verification Footer                 */}
          {/* ================================================================= */}
          <footer className="print-avoid-break pt-4 mt-6 border-t-2 border-slate-300 space-y-4">
            {showSignatures && (
              <div className="flex items-end justify-between gap-6 relative min-h-[90px]">
                {/* Director details */}
                <div className="text-left text-[10pt] text-slate-800 space-y-1">
                  <div className="font-bold text-blue-950">Генеральный директор</div>
                  <div>ООО «ДС-Инжиниринг»</div>
                  <div className="pt-3 font-bold">Некрасов С.Ю.</div>
                </div>

                {/* Blue ink facsimile seal in the center */}
                <div className="flex flex-col items-center justify-center relative">
                  <img
                    src="/images/director_signature.svg"
                    alt="Подпись"
                    className="h-10 w-auto object-contain absolute -top-4 opacity-90"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-800 text-blue-900 text-[8pt] font-bold flex flex-col items-center justify-center text-center p-1 leading-tight transform -rotate-6 bg-white/80">
                    <span className="text-[6.5pt] text-blue-700 uppercase">ОТК Контроль</span>
                    <span>ООО «ДС-ИНЖИНИРИНГ»</span>
                    <span className="text-[7pt] font-mono">ПОВЕРЕНО</span>
                    <span className="text-[6pt] text-slate-500">ОГРН 1126312004520</span>
                  </div>
                </div>

                {/* Lead Metrologist details */}
                <div className="text-right text-[10pt] text-slate-800 space-y-1">
                  <div className="font-bold text-blue-950">Инженер-метролог / ОТК</div>
                  <div>Служба главного метролога</div>
                  <div className="pt-3 font-bold">Ярыш И.В. / Скобелев А.С.</div>
                </div>
              </div>
            )}

            {/* Bottom metadata text */}
            <div className="flex items-center justify-between text-[8pt] text-slate-500 pt-2 border-t border-slate-200">
              <div>
                Официальный документ сформирован сертифицированной системой учета «ДС-Инжиниринг».
              </div>
              <div className="font-mono text-slate-600">
                https://ds-engineering.ru/ • Стр. 1 из 1
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
