import React, { useState, useMemo, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  ClipboardPaste,
  HelpCircle,
  FileText,
  Tag
} from 'lucide-react';
import { PriceItem } from '../../data/priceListsData';
import { fetchWithCsrf } from '../../services/csrfService';
import { PriceService } from '../../services/PriceService';

export interface PriceListCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: { addedCount: number; updatedCount: number; totalCount: number }) => void;
  currentItems?: PriceItem[];
  isDark?: boolean;
}

interface ParsedPreviewRow {
  sku: string;
  name: string;
  category: PriceItem['category'];
  categoryLabel: string;
  subCategory?: string;
  costPriceRub: number;
  priceRub: number;
  vatRate: number;
  inStock: boolean;
  manufacturer?: string;
  status: 'new' | 'update' | 'identical' | 'invalid';
  oldPrice?: number;
  oldCost?: number;
  error?: string;
}

export const PriceListCsvImportModal: React.FC<PriceListCsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentItems = [],
  isDark = true
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setCsvImportMode] = useState<'merge' | 'replace'>('merge');
  const [csvDelimiter, setCsvDelimiter] = useState<'auto' | ';' | ',' | '\t'>('auto');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse CSV into rows
  const parseRows = (text: string, delim: string): string[][] => {
    let effectiveDelimiter = delim;
    if (delim === 'auto') {
      const firstLine = text.split(/\r?\n/)[0] || '';
      const semiCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const tabCount = (firstLine.match(/\t/g) || []).length;
      if (tabCount > semiCount && tabCount > commaCount) effectiveDelimiter = '\t';
      else if (commaCount > semiCount && commaCount > tabCount) effectiveDelimiter = ',';
      else effectiveDelimiter = ';';
    }

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === effectiveDelimiter && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  // Parse preview rows from content
  const previewData = useMemo<{
    rows: ParsedPreviewRow[];
    detectedDelimiter: string;
    newCount: number;
    updateCount: number;
    identicalCount: number;
    errorCount: number;
  }>(() => {
    if (!csvContent.trim()) {
      return { rows: [], detectedDelimiter: ';', newCount: 0, updateCount: 0, identicalCount: 0, errorCount: 0 };
    }

    let detected = csvDelimiter;
    if (csvDelimiter === 'auto') {
      const firstLine = csvContent.split(/\r?\n/)[0] || '';
      const semiCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const tabCount = (firstLine.match(/\t/g) || []).length;
      if (tabCount > semiCount && tabCount > commaCount) detected = '\t';
      else if (commaCount > semiCount && commaCount > tabCount) detected = ',';
      else detected = ';';
    }

    const rawRows = parseRows(csvContent, detected);
    if (rawRows.length < 2) {
      return { rows: [], detectedDelimiter: detected, newCount: 0, updateCount: 0, identicalCount: 0, errorCount: 0 };
    }

    const headers = rawRows[0].map(h => h.toLowerCase().trim().replace(/[\"\'\s]/g, ''));
    const findCol = (...keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

    const skuIdx = findCol('артикул', 'sku', 'код', 'номер');
    const nameIdx = findCol('наименование', 'модель', 'название', 'name', 'title');
    const catIdx = findCol('категория', 'раздел', 'category', 'тип');
    const subCatIdx = findCol('подкатегория', 'серия', 'subcategory');
    const mfgIdx = findCol('производитель', 'бренд', 'вендор', 'brand', 'manufacturer');
    const costIdx = findCol('себестоимость', 'закупка', 'cost', 'costpricerub', 'закупки');
    const priceIdx = findCol('ценапродажи', 'продажа', 'цена', 'price', 'pricerub', 'стоимость');
    const vatIdx = findCol('ндс', 'vat', 'vatrate', 'ставка');
    const stockIdx = findCol('наличие', 'склад', 'stock', 'instock', 'вналичии');

    const parseNum = (val: string | undefined, defaultVal = 0): number => {
      if (!val) return defaultVal;
      const clean = val.replace(/\s/g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '');
      const num = parseFloat(clean);
      return isNaN(num) ? defaultVal : num;
    };

    const mapCategory = (rawCat: string = ''): { category: PriceItem['category']; label: string } => {
      const l = rawCat.toLowerCase();
      if (l.includes('программ') || l.includes('софт') || l.includes('soft') || l.includes('cad') || l.includes('cam')) {
        return { category: 'software', label: 'Программное ПО' };
      }
      if (l.includes('услуг') || l.includes('сервис') || l.includes('измерен') || l.includes('контрол') || l.includes('service')) {
        return { category: 'services', label: 'Инжиниринговые услуги' };
      }
      if (l.includes('оснастк') || l.includes('щуп') || l.includes('датчик') || l.includes('renishaw') || l.includes('access')) {
        return { category: 'accessories', label: 'Оснастка и допоборудование' };
      }
      if (l.includes('непрофильн') || l.includes('доставк') || l.includes('такелаж')) {
        return { category: 'non_core_services', label: 'Непрофильные услуги' };
      }
      return { category: 'hardware', label: 'Оборудование СИ' };
    };

    const currentMap = new Map<string, PriceItem>();
    currentItems.forEach(i => {
      if (i.sku) currentMap.set(i.sku.trim().toLowerCase(), i);
    });

    const parsed: ParsedPreviewRow[] = [];
    let newCount = 0;
    let updateCount = 0;
    let identicalCount = 0;
    let errorCount = 0;

    for (let r = 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      const rawSku = (skuIdx !== -1 ? row[skuIdx] : '') || '';
      const rawName = (nameIdx !== -1 ? row[nameIdx] : '') || '';

      if (!rawSku && !rawName) continue;

      const catInfo = mapCategory(catIdx !== -1 ? row[catIdx] : '');
      const cost = parseNum(costIdx !== -1 ? row[costIdx] : undefined, 0);
      const price = parseNum(priceIdx !== -1 ? row[priceIdx] : undefined, 0);
      const vat = parseNum(vatIdx !== -1 ? row[vatIdx] : undefined, 22);
      const rawStock = stockIdx !== -1 ? (row[stockIdx] || '').toLowerCase() : 'да';
      const inStock = !rawStock.includes('нет') && !rawStock.includes('заказ') && !rawStock.includes('false') && !rawStock.includes('0');

      const cleanSku = rawSku.trim();
      const existing = cleanSku ? currentMap.get(cleanSku.toLowerCase()) : undefined;

      let status: ParsedPreviewRow['status'] = 'new';
      let oldPrice: number | undefined;
      let oldCost: number | undefined;

      if (!cleanSku && !rawName) {
        status = 'invalid';
        errorCount++;
      } else if (existing) {
        oldPrice = existing.priceRub;
        oldCost = existing.costPriceRub;
        if (existing.priceRub === price && existing.costPriceRub === cost) {
          status = 'identical';
          identicalCount++;
        } else {
          status = 'update';
          updateCount++;
        }
      } else {
        status = 'new';
        newCount++;
      }

      parsed.push({
        sku: cleanSku || `DS-${catInfo.category.slice(0, 3).toUpperCase()}-NEW`,
        name: rawName || cleanSku,
        category: catInfo.category,
        categoryLabel: catInfo.label,
        subCategory: subCatIdx !== -1 ? row[subCatIdx] : undefined,
        manufacturer: mfgIdx !== -1 && row[mfgIdx] ? row[mfgIdx] : 'ДС-Инжиниринг',
        costPriceRub: cost,
        priceRub: price,
        vatRate: vat,
        inStock,
        status,
        oldPrice,
        oldCost
      });
    }

    return {
      rows: parsed,
      detectedDelimiter: detected,
      newCount,
      updateCount,
      identicalCount,
      errorCount
    };
  }, [csvContent, csvDelimiter, currentItems]);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setCsvContent(content);
        setErrorMessage(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Не удалось прочитать выбранный файл');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDownloadSampleCsv = () => {
    const sampleHeaders = 'Артикул (SKU);Категория;Наименование оборудования или ПО;Производитель;Себестоимость закупки (руб);Цена продажи без НДС (руб);Ставка НДС (%);В наличии (да/нет);Примечания';
    const sampleRows = [
      'PMT-ARM-GMP-P;hardware;Мобильная КИМ PMT GAMMA+ (Серия P, 7 осей, лазерный 3D-сканер PMT GS);PMT;3800000;5400000;22;да;Метрологический сертификат РФ в комплекте',
      'SCAN-SL-OMNI;hardware;Оптический 3D-сканер ScanLine EasyScan Omni (со статусом СИ в ФГИС «АРШИН»);ScanLine 3D;2900000;4200000;22;да;Регистрационный номер 91234-24',
      'SW-PW-INSP-PERP;software;PolyWorks|Inspector™ Бессрочная сетевая лицензия;InnovMetric;1200000;1650000;22;да;Включает 1 год сервисной подписки',
      'REN-SP25M-KIT;accessories;Комплект прецизионного сканирующего щупа Renishaw SP25M;Renishaw;450000;620000;22;да;Модули SM25-1, SM25-2, сфера Ø 25 мм',
      'SRV-CALIB-ANNUAL;services;Ежегодная калибровка и лазерная интерферометрия КИМ (Renishaw XL-80);ДС-Инжиниринг;120000;185000;22;да;Выезд ведущего метролога с эталонами'
    ];
    const fullCsv = [sampleHeaders, ...sampleRows].join('\n');
    const blob = new Blob(['\uFEFF' + fullCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ds_engineering_price_list_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = async () => {
    if (!csvContent.trim()) {
      setErrorMessage('Вставьте содержимое CSV или загрузите файл');
      return;
    }

    if (previewData.rows.length === 0) {
      setErrorMessage('Не найдено корректных строк номенклатуры для импорта');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Send to server-side proxy
      const res = await fetchWithCsrf('/api/crm/price-items/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent,
          mode: importMode,
          delimiter: csvDelimiter
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка при импорте прайс-листа на сервере');
      }

      // 2. Also sync to client-side Firestore if available
      try {
        const itemsToUpsert: PriceItem[] = previewData.rows
          .filter(r => r.status !== 'invalid')
          .map(r => ({
            id: `pi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sku: r.sku,
            name: r.name,
            category: r.category,
            categoryLabel: r.categoryLabel,
            subCategory: r.subCategory,
            manufacturer: r.manufacturer || 'ДС-Инжиниринг',
            costPriceRub: r.costPriceRub,
            priceRub: r.priceRub,
            partnerPriceRub: Math.round(r.priceRub * 0.9),
            vatRate: r.vatRate,
            inStock: r.inStock,
            unit: r.category === 'software' ? 'лицензия' : r.category === 'services' ? 'услуга' : 'комплект',
            description: r.name,
            maxDiscountPercent: 15,
            leadTimeDays: 7,
            currentVersion: 1,
            isActive: true
          }));

        if (itemsToUpsert.length > 0) {
          await PriceService.batchUpsertPriceItems(itemsToUpsert);
        }
      } catch (fsErr) {
        console.warn('[CSV Import] Firestore bulk sync silent notice:', fsErr);
      }

      onSuccess({
        addedCount: data.addedCount || previewData.newCount,
        updatedCount: data.updatedCount || previewData.updateCount,
        totalCount: data.totalCount || previewData.rows.length
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка импорта CSV файла');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className={`border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-4 shrink-0 ${
          isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-500 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Импорт номенклатуры из CSV / Excel
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Массовое обновление каталога оборудования, ПО и услуг «ДС-Инжиниринг»
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' 
                  : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
              title="Скачать эталонный файл CSV с корректными заголовками и примерами"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Скачать шаблон CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="p-1 hover:opacity-70">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mode & Delimiter Settings */}
          <div className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <label className="font-bold block mb-1.5">Режим обновления базы:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCsvImportMode('merge')}
                  className={`flex-1 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    importMode === 'merge'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-semibold text-xs">Объединить и обновить</div>
                  <div className="text-[10.5px] opacity-75 mt-0.5">Обновит цены по SKU, добавит новые</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCsvImportMode('replace')}
                  className={`flex-1 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    importMode === 'replace'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-400 font-bold'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-semibold text-xs">Полная замена</div>
                  <div className="text-[10.5px] opacity-75 mt-0.5">Заменит весь каталог файлом</div>
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1.5">Разделитель колонок:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'auto', label: 'Авто' },
                  { id: ';', label: 'Точка с зап. (;)' },
                  { id: ',', label: 'Запятая (,)' },
                  { id: '\t', label: 'Таб (Excel)' }
                ].map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setCsvDelimiter(d.id as any)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      csvDelimiter === d.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Tabs: File Upload vs Direct Paste */}
          <div className="space-y-2">
            <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`pb-2 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Загрузить CSV-файл</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`pb-2 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'paste'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Вставить текст из буфера (Excel / Sheets)</span>
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : isDark 
                      ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70' 
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv,.tab"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                {fileName ? (
                  <div>
                    <span className="text-sm font-bold text-blue-400 block">{fileName}</span>
                    <span className="text-[11px] text-slate-400 mt-1 block">Нажмите, чтобы выбрать другой файл</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs sm:text-sm font-bold block">
                      Перетащите сюда файл CSV или нажмите для выбора
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Поддерживаются файлы `.csv`, `.tsv`, `.txt` с разделителями `;`, `,` или табуляцией
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <textarea
                  rows={5}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder={`Вставьте строки, скопированные из Excel или Google Таблиц:\nАртикул;Категория;Наименование;Себестоимость;Цена продажи\nPMT-ARM-GMP-P;hardware;Мобильная КИМ PMT GAMMA+;3800000;5400000\nSCAN-SL-OMNI;hardware;3D-сканер ScanLine EasyScan Omni;2900000;4200000`}
                  className={`w-full p-3 font-mono text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Разделитель колонок определится автоматически (или выберите выше)</span>
                  <span>Символов: {csvContent.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Preview Table */}
          {previewData.rows.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">
                    Предварительный просмотр данных ({previewData.rows.length} строк)
                  </span>
                </div>

                {/* Summary Badges */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold">
                  {previewData.newCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      +{previewData.newCount} новых
                    </span>
                  )}
                  {previewData.updateCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      {previewData.updateCount} обновлений цен
                    </span>
                  )}
                  {previewData.identicalCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30">
                      {previewData.identicalCount} без изм.
                    </span>
                  )}
                  {previewData.errorCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      {previewData.errorCount} ошибок
                    </span>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className={`sticky top-0 z-10 text-[10.5px] font-bold uppercase tracking-wider ${
                    isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <tr>
                      <th className="py-2 px-3">Статус</th>
                      <th className="py-2 px-3">Артикул</th>
                      <th className="py-2 px-3">Наименование</th>
                      <th className="py-2 px-3">Категория</th>
                      <th className="py-2 px-3 text-right">Закупка</th>
                      <th className="py-2 px-3 text-right">Продажа</th>
                      <th className="py-2 px-3 text-center">Склад</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {previewData.rows.map((row, idx) => (
                      <tr key={idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="py-1.5 px-3">
                          {row.status === 'new' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Новая
                            </span>
                          ) : row.status === 'update' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Обновление
                            </span>
                          ) : row.status === 'identical' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold text-slate-500">
                              Совпадает
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Ошибка
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-mono font-semibold text-[11px] text-blue-400">
                          {row.sku}
                        </td>
                        <td className="py-1.5 px-3 font-medium truncate max-w-[200px]" title={row.name}>
                          {row.name}
                        </td>
                        <td className="py-1.5 px-3 text-slate-400 text-[11px]">
                          {row.categoryLabel}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono text-[11px] text-slate-400">
                          {row.costPriceRub ? `${row.costPriceRub.toLocaleString('ru-RU')} ₽` : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono text-[11px] font-bold">
                          {row.status === 'update' && row.oldPrice !== undefined ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="line-through text-slate-500 text-[10px]">
                                {row.oldPrice.toLocaleString('ru-RU')}
                              </span>
                              <ArrowRight className="w-2.5 h-2.5 text-blue-400" />
                              <span className="text-emerald-400">
                                {row.priceRub.toLocaleString('ru-RU')} ₽
                              </span>
                            </div>
                          ) : (
                            `${row.priceRub.toLocaleString('ru-RU')} ₽`
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${row.inStock ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
          isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="text-xs text-slate-400 hidden sm:block">
            {previewData.rows.length > 0 ? (
              <span>Готово к загрузке: <strong>{previewData.rows.length}</strong> позиций</span>
            ) : (
              <span>Загрузите файл или вставьте строки таблицы</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Отмена
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isSubmitting || previewData.rows.length === 0}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Импорт данных...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Импортировать ({previewData.rows.length} поз.)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceListCsvImportModal;
