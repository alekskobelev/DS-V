import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Building2, 
  User, 
  Phone, 
  Calendar, 
  Percent, 
  Check, 
  Plus, 
  Trash2, 
  ExternalLink, 
  FileCheck, 
  Copy, 
  Edit3, 
  Paperclip, 
  ShieldCheck, 
  AlertCircle,
  Briefcase,
  ChevronRight,
  Calculator,
  Layers,
  Sparkles
} from 'lucide-react';
import { CommercialProposal, CurrencyCode, getCurrencySymbol } from '../../types';
import { SpecificationItem } from '../../types/proposalEditor';
import { STAFF_DIRECTORY } from '../../utils/staffDirectory';
import { downloadProposalPdf } from '../../utils/printProposal';
import { useApp } from '../../context/AppContext';

interface ProposalQuickSlideOverProps {
  proposal: CommercialProposal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProposal?: (updated: CommercialProposal) => void;
  onOpenFullEditor?: (proposal: CommercialProposal) => void;
  onCreateContractFromProposal?: (proposal: CommercialProposal) => void;
  onCloneProposal?: (proposal: CommercialProposal) => void;
}

// Engineering catalog presets for rapid 1-click specification addition
const QUICK_PRESETS: { name: string; category: string; price: number; unit: string }[] = [
  { name: 'Портальная координатно-измерительная машина PMT GAMMA+ (синий лазер)', category: 'Оборудование', price: 8950000, unit: 'компл.' },
  { name: 'Стационарная КИМ PMT Future Plus (ЧПУ, Renishaw PH10M)', category: 'Оборудование', price: 12400000, unit: 'компл.' },
  { name: 'Оптический метрологический 3D-сканер Shining 3D FreeScan Combo', category: 'Оборудование', price: 3850000, unit: 'компл.' },
  { name: 'Лазерный сканер ScanLine EasyScan UE ProNova', category: 'Оборудование', price: 4200000, unit: 'компл.' },
  { name: 'Прецизионные услуги 3D-контроля геометрии и карты отклонений GD&T', category: 'Услуги', price: 180000, unit: 'протокол' },
  { name: 'Первичная/периодическая поверка СИ с внесением во ФГИС «АРШИН»', category: 'Метрология', price: 95000, unit: 'свидетельство' },
  { name: 'Обучение операторов КИМ и специалистов ОТК (PolyWorks / TopSolid)', category: 'Обучение', price: 240000, unit: 'курс (3 чел.)' },
  { name: 'Годовое сервисное ТО, калибровка и юстировка оптико-механических узлов КИМ', category: 'Сервис', price: 320000, unit: 'договор' },
];

export const ProposalQuickSlideOver: React.FC<ProposalQuickSlideOverProps> = ({
  proposal,
  isOpen,
  onClose,
  onUpdateProposal,
  onOpenFullEditor,
  onCreateContractFromProposal,
  onCloneProposal
}) => {
  if (!isOpen || !proposal) return null;

  const { showToast, crmSettings } = useApp();
  const defaultVat = crmSettings?.defaultVatRate ?? 22;

  const [activeTab, setActiveTab] = useState<'calc' | 'details' | 'files'>('calc');
  const [vatRate, setVatRate] = useState<number>(proposal.vatRate ?? defaultVat);
  const [vatMode, setVatMode] = useState<'standard' | 'export_zero' | 'no_vat' | 'custom'>(proposal.vatMode || 'standard');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Local specification items state
  const [items, setItems] = useState<SpecificationItem[]>(() => {
    if (proposal.items && Array.isArray(proposal.items) && proposal.items.length > 0) {
      return proposal.items;
    }
    // Default initial item based on proposal content
    return [
      {
        id: `item_${Date.now()}_1`,
        name: proposal.content || 'Поставка измерительного оборудования и инжиниринговых услуг',
        quantity: 1,
        unit: 'компл.',
        price: proposal.amount ? Math.round(proposal.amount / (1 + (proposal.vatRate ?? defaultVat) / 100)) : 100000,
        discountPercent: 0
      }
    ];
  });

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const discountedPrice = item.price * (1 - (item.discountPercent || 0) / 100);
      return sum + discountedPrice * item.quantity;
    }, 0);
  }, [items]);

  const effectiveVatRate = vatMode === 'export_zero' || vatMode === 'no_vat' ? 0 : vatRate;
  const vatAmount = useMemo(() => Math.round(subtotal * (effectiveVatRate / 100)), [subtotal, effectiveVatRate]);
  const totalWithVat = useMemo(() => subtotal + vatAmount, [subtotal, vatAmount]);

  // Handle adding an item
  const handleAddItem = (preset?: typeof QUICK_PRESETS[0]) => {
    const newItem: SpecificationItem = preset ? {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      category: preset.category,
      quantity: 1,
      unit: preset.unit,
      price: preset.price,
      discountPercent: 0
    } : {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: 'Новая позиция спецификации',
      quantity: 1,
      unit: 'шт.',
      price: 50000,
      discountPercent: 0
    };

    setItems(prev => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof SpecificationItem, val: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      showToast('В спецификации должна оставаться хотя бы одна позиция');
      return;
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Save changes to current proposal
  const handleSaveCalculation = () => {
    if (!onUpdateProposal) return;
    const updated: CommercialProposal = {
      ...proposal,
      items,
      amount: totalWithVat,
      vatRate: effectiveVatRate,
      vatMode
    };
    onUpdateProposal(updated);
    showToast('Спецификация и сумма КП успешно обновлены');
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      showToast('Генерация официального бланка ТКП (PDF)...');
      await downloadProposalPdf({
        ...proposal,
        items,
        amount: totalWithVat,
        vatRate: effectiveVatRate
      });
      showToast('Бланк ТКП успешно сгенерирован');
    } catch (e) {
      console.error(e);
      showToast('Ошибка при формировании PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const isAkp = Boolean(proposal.isAlternative);
  const isPartnerAkp = isAkp && (proposal.akpPurpose === 'partner_tender' || !proposal.akpPurpose);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-slate-800">
        
        {/* Drawer Header */}
        <div className={`p-4 sm:p-5 border-b shrink-0 ${
          isPartnerAkp 
            ? 'bg-slate-800 text-white border-slate-700' 
            : 'bg-gradient-to-r from-blue-900 to-indigo-950 text-white border-blue-950'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm sm:text-base font-black tracking-wider text-white">
                  {proposal.outgoingNumber}
                </span>
                {isPartnerAkp ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-600 text-slate-100 border border-slate-500">
                    АКП • Для партнеров (Тендер)
                  </span>
                ) : isAkp ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white border border-blue-400">
                    АКП • Альтернативная поставка
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white border border-emerald-400">
                    Основное ТКП
                  </span>
                )}
                <span className="text-xs text-blue-200 dark:text-slate-300">
                  от {proposal.date}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">
                {proposal.toCompany}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Закрыть шторку (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Segmented Nav */}
          <div className="flex items-center gap-1 mt-4 p-1 rounded-xl bg-black/20 text-xs">
            <button
              onClick={() => setActiveTab('calc')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'calc' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Расчет & НДС {effectiveVatRate}%</span>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'details' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Реквизиты & Сделка</span>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'files' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Файлы ({proposal.versions?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950">

          {/* TAB 1: SPECIFICATION & FAST CALCULATOR */}
          {activeTab === 'calc' && (
            <div className="space-y-4">
              {/* VAT Mode Bar */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Налоговый режим:</span>
                  <select
                    value={vatMode}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setVatMode(val);
                      if (val === 'export_zero' || val === 'no_vat') setVatRate(0);
                      else setVatRate(defaultVat);
                    }}
                    className="font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2.5 py-1 outline-none"
                  >
                    <option value="standard">НДС {defaultVat}% (Стандарт РФ)</option>
                    <option value="export_zero">НДС 0% (Экспорт / ЕАЭС)</option>
                    <option value="no_vat">Без НДС (УСН / Спецрежим)</option>
                    <option value="custom">Особая ставка НДС</option>
                  </select>
                </div>

                {vatMode === 'custom' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Ставка %:</span>
                    <input
                      type="number"
                      value={vatRate}
                      onChange={(e) => setVatRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Specification Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                      Спецификация коммерческого предложения ({items.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddItem()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить позицию</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
                  {items.map((item, idx) => {
                    const rowPriceWithoutVat = item.price * (1 - (item.discountPercent || 0) / 100);
                    const rowTotal = Math.round(rowPriceWithoutVat * item.quantity);

                    return (
                      <div key={item.id} className="p-3 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                            className="flex-1 text-xs font-semibold bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 pb-0.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            placeholder="Наименование оборудования или услуги..."
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer shrink-0"
                            title="Удалить позицию"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-[11px] pl-7">
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase font-bold">Кол-во:</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-14 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold"
                              />
                              <span className="text-slate-500 text-[10px]">{item.unit || 'шт.'}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase font-bold">Цена без НДС:</span>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold"
                            />
                          </div>

                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase font-bold">Скидка:</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="90"
                                value={item.discountPercent || 0}
                                onChange={(e) => handleUpdateItem(item.id, 'discountPercent', Math.min(90, Math.max(0, parseFloat(e.target.value) || 0)))}
                                className="w-12 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold"
                              />
                              <span className="text-slate-500 text-[10px]">%</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-slate-500 block text-[9px] uppercase font-bold">Итого строка:</span>
                            <span className="font-mono font-black text-slate-900 dark:text-white">
                              {rowTotal.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick 1-Click Presets Palette */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Быстрое добавление позиций из каталога компании:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRESETS.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleAddItem(preset)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <Plus className="w-2.5 h-2.5 text-blue-600" />
                        <span className="truncate max-w-[200px]">{preset.name}</span>
                        <span className="font-mono text-slate-400">({(preset.price / 1000).toLocaleString('ru-RU')} т.р.)</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Totals Calculation */}
                <div className="p-4 bg-slate-100/90 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Сумма без НДС:</span>
                    <span className="font-mono font-bold">{subtotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>НДС ({effectiveVatRate}%):</span>
                    <span className="font-mono font-bold">{vatAmount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex items-center justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Итого к оплате с НДС:</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">{totalWithVat.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>

              {/* Save Calculation Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCalculation}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Сохранить расчет в КП</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS & LINKED DEAL */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              {/* Customer Box */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Данные заказчика и реквизиты</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Организация:</span>
                    <strong className="text-slate-900 dark:text-white">{proposal.toCompany}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Контактное лицо:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{proposal.contactPerson || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Телефон:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{proposal.contactPhone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Ответственный менеджер:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{proposal.preparedBy || 'Скобелев А.С.'}</span>
                  </div>
                </div>
              </div>

              {/* Deal Link Box */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Привязка к сделке CRM</span>
                </h4>
                {proposal.dealId ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold text-xs">
                        {proposal.dealId}
                      </span>
                      <strong className="text-slate-900 dark:text-white text-xs">
                        {proposal.dealTitle || 'Сделка в воронке'}
                      </strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Воронка: <strong className="text-slate-700 dark:text-slate-300">{proposal.dealFunnel || 'Оборудование'}</strong> • Стадия: <strong className="text-slate-700 dark:text-slate-300">{proposal.dealStage || 'Переговоры'}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs italic">
                    Данное коммерческое предложение пока не привязано к конкретной сделке в Канбан-воронке.
                  </div>
                )}
              </div>

              {/* Notes */}
              {proposal.note && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Примечания и условия поставки
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {proposal.note}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTACHED FILES & VERSIONS */}
          {activeTab === 'files' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Прикрепленные файлы ТКП ({proposal.versions?.length || 0})
                </span>
              </div>

              {proposal.versions && proposal.versions.length > 0 ? (
                <div className="space-y-2">
                  {proposal.versions.map((v) => (
                    <div 
                      key={v.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {v.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Версия v{v.version} • {v.size} • Загружен {v.uploadedAt}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Скачать</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <div className="font-semibold text-slate-700 dark:text-slate-300">Файлы версий еще не прикреплены</div>
                  <div className="text-[11px]">Вы можете сгенерировать официальный бланк ТКП (PDF) в 1 клик кнопкой ниже.</div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Drawer Sticky Footer with Fast Document Workflow */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              title="Скачать официальный бланк ТКП с синей печатью компании"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'Генерация...' : 'Скачать ТКП (PDF)'}</span>
            </button>

            {onCreateContractFromProposal && (
              <button
                type="button"
                onClick={() => onCreateContractFromProposal(proposal)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                title="Автоматически сформировать проект Договора на основе данного КП"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Создать Договор</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onCloneProposal && (
              <button
                type="button"
                onClick={() => onCloneProposal(proposal)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                title="Создать дубликат КП (Копию / АКП)"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}

            {onOpenFullEditor && (
              <button
                type="button"
                onClick={() => onOpenFullEditor(proposal)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                title="Открыть полноэкранный редактор бланка A4"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Редактор A4</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
