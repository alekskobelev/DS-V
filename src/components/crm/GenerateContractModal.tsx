import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Building2, 
  UserCheck, 
  Check, 
  ShieldCheck, 
  Calendar, 
  Hash, 
  AlertCircle,
  Search,
  Loader2,
  Sparkles,
  Layers,
  ChevronRight,
  Stamp,
  Globe,
  Percent,
  Eye,
  Columns,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  CheckCircle2,
  FileCheck,
  Edit3
} from 'lucide-react';
import { ProjectContract, CurrencyCode, getCurrencySymbol } from '../../types';
import { STAFF_DIRECTORY } from '../../utils/staffDirectory';
import { 
  ContractPrintData, 
  ContractSpecificationItem, 
  generateContractHtml, 
  downloadContractPdf, 
  printContract 
} from '../../utils/printContract';
import { useApp } from '../../context/AppContext';

interface GenerateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: ProjectContract | null;
  onSaveContract?: (contract: ProjectContract) => void;
}

const CONTRACT_TYPE_PRESETS: { type: string; title: string; defaultScope: string }[] = [
  {
    type: 'supply',
    title: 'Договор на поставку координатно-измерительного оборудования и специализированного ПО',
    defaultScope: 'Поставка прецизионной КИМ, пусконаладка, калибровка оптико-механических узлов и внесение сведений во ФГИС «АРШИН».'
  },
  {
    type: 'services',
    title: 'Договор на оказание инжиниринговых услуг и прецизионного 3D-контроля геометрии',
    defaultScope: 'Оптическое 3D-сканирование эталонных деталей, построение карт отклонений GD&T и выдача протоколов метрологического контроля.'
  },
  {
    type: 'maintenance',
    title: 'Договор на годовое сервисное техническое обслуживание и юстировку КИМ',
    defaultScope: 'Регламентное ТО, контроль погрешности по ГОСТ Р ИСО 10360, замена расходных элементов и внесение поверки во ФГИС «АРШИН».'
  }
];

export const GenerateContractModal: React.FC<GenerateContractModalProps> = ({
  isOpen,
  onClose,
  contract,
  onSaveContract
}) => {
  const { showToast, addContract, updateContract, crmSettings } = useApp();

  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [city, setCity] = useState('г. Самара');
  const [contractTitle, setContractTitle] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientInn, setClientInn] = useState('7701234567');
  const [clientKpp, setClientKpp] = useState('770101001');
  const [clientAddress, setClientAddress] = useState('125009, РФ, г. Москва, ул. Тверская, д. 10');
  const [clientBank, setClientBank] = useState('ПАО Сбербанк');
  const [clientBik, setClientBik] = useState('044525225');
  const [clientAccount, setClientAccount] = useState('40702810938000012345');
  const [clientCorrAccount, setClientCorrAccount] = useState('30101810400000000225');
  const [clientSigner, setClientSigner] = useState('Иванова Ивана Ивановича');
  const [clientSignerPost, setClientSignerPost] = useState('Генерального директора');
  const [clientSignerBasis, setClientSignerBasis] = useState('Устава');

  // Commercials
  const [vatRate, setVatRate] = useState<number>(22);
  const [vatMode, setVatMode] = useState<'standard' | 'export_zero' | 'no_vat'>('standard');
  const [advancePercent, setAdvancePercent] = useState<number>(50);
  const [deliveryDays, setDeliveryDays] = useState('15 (пятнадцать) рабочих дней');
  const [warrantyMonths, setWarrantyMonths] = useState('24 (двадцать четыре) месяца');
  const [scope, setScope] = useState('');
  const [curator, setCurator] = useState('Скобелев Александр Сергеевич');
  const [curatorPhone, setCuratorPhone] = useState('+7 (937) 984-61-51');

  // Specification Items
  const [items, setItems] = useState<ContractSpecificationItem[]>([
    {
      name: 'Портальная координатно-измерительная машина PMT GAMMA+ (синий лазерный сканер)',
      category: 'Оборудование',
      quantity: 1,
      unit: 'компл.',
      price: 8950000
    },
    {
      name: 'Комплекс пусконаладочных работ, юстировка и метрологическая поверка по ГОСТ Р ИСО 10360 (ФГИС АРШИН)',
      category: 'Метрология',
      quantity: 1,
      unit: 'услуга',
      price: 320000
    }
  ]);

  const [includeStamp, setIncludeStamp] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [zoomScale, setZoomScale] = useState(1);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('preview');
  const [isExporting, setIsExporting] = useState(false);

  // Initialize from props
  useEffect(() => {
    if (contract) {
      setContractNumber(contract.number || `ДОГ-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900 + 100))}`);
      setContractDate(contract.date || new Date().toLocaleDateString('ru-RU'));
      setContractTitle(contract.title || CONTRACT_TYPE_PRESETS[0].title);
      setClientCompany(contract.company || '');
      setCurator(contract.curator || 'Скобелев Александр Сергеевич');
      setCuratorPhone(contract.curatorPhone || '+7 (937) 984-61-51');
      setVatRate(contract.vatRate !== undefined ? contract.vatRate : 22);
      setVatMode(contract.vatMode === 'no_vat' ? 'no_vat' : contract.vatMode === 'export_zero' ? 'export_zero' : 'standard');
      setScope(contract.scope || CONTRACT_TYPE_PRESETS[0].defaultScope);

      const parsedPrice = contract.amount ? parseFloat(contract.amount.replace(/[^0-9.]/g, '')) || 2500000 : 2500000;
      setItems([
        {
          name: contract.title || 'Поставка измерительного оборудования и выполнение пусконаладочных работ',
          category: 'Оборудование',
          quantity: 1,
          unit: 'компл.',
          price: Math.round(parsedPrice / 1.22)
        }
      ]);
    } else {
      setContractNumber(`ДОГ-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900 + 100))}`);
      setContractDate(new Date().toLocaleDateString('ru-RU'));
      setContractTitle(CONTRACT_TYPE_PRESETS[0].title);
      setScope(CONTRACT_TYPE_PRESETS[0].defaultScope);
      setClientCompany('ООО «Самарский механический завод»');
    }
  }, [contract, isOpen]);

  if (!isOpen) return null;

  // Total Calculations
  const subtotalWithoutVat = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const effectiveVatRate = vatMode === 'no_vat' ? 0 : vatMode === 'export_zero' ? 0 : vatRate;
  const vatAmount = (vatMode === 'no_vat' || vatMode === 'export_zero') ? 0 : Math.round(subtotalWithoutVat * (effectiveVatRate / 100));
  const totalWithVat = subtotalWithoutVat + vatAmount;

  // Add Item
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: 'Новая позиция спецификации оборудования / услуг',
        quantity: 1,
        unit: 'шт.',
        price: 150000
      }
    ]);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Update Item
  const handleUpdateItem = (index: number, key: keyof ContractSpecificationItem, value: any) => {
    setItems(items.map((it, idx) => {
      if (idx === index) {
        return { ...it, [key]: value };
      }
      return it;
    }));
  };

  // Build Print Data
  const contractPrintData: ContractPrintData = {
    number: contractNumber,
    date: contractDate,
    city,
    title: contractTitle,
    clientCompany,
    clientInn,
    clientKpp,
    clientAddress,
    clientBank,
    clientBik,
    clientAccount,
    clientCorrAccount,
    clientSigner,
    clientSignerPost,
    clientSignerBasis,
    amount: totalWithVat,
    currency: 'RUB',
    vatRate: effectiveVatRate,
    vatMode,
    advancePercent,
    deliveryDays,
    warrantyMonths,
    scope,
    items,
    includeStamp,
    includeSignature,
    curatorName: curator,
    curatorPhone
  };

  // Save to CRM database
  const handleSaveContractRecord = () => {
    const formattedAmount = `${totalWithVat.toLocaleString('ru-RU')} ₽`;
    const updatedContractData: ProjectContract = {
      id: contract?.id || `cnt_${Date.now()}`,
      number: contractNumber,
      title: contractTitle,
      company: clientCompany,
      date: contractDate,
      status: contract?.status || 'Исполняется',
      statusColor: contract?.statusColor || 'blue',
      supportUntil: `${new Date().getDate()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${new Date().getFullYear() + 2}`,
      curator,
      curatorPhone,
      amount: formattedAmount,
      currency: 'RUB',
      vatRate: effectiveVatRate,
      vatMode,
      vatIncluded: true,
      scope,
      documents: contract?.documents || [],
      dealId: contract?.dealId,
      dealTitle: contract?.dealTitle
    };

    if (onSaveContract) {
      onSaveContract(updatedContractData);
    } else if (contract) {
      updateContract(contract.id, updatedContractData);
    } else {
      addContract(updatedContractData);
    }

    showToast(`Договор ${contractNumber} успешно сохранен в базе CRM`);
    onClose();
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await downloadContractPdf(contractPrintData);
      showToast('Официальный PDF договор успешно сгенерирован и загружен');
    } catch (e) {
      console.error(e);
      showToast('Ошибка при генерации PDF документа');
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Print
  const handlePrint = () => {
    printContract(contractPrintData);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-7xl h-[94vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Генератор официальных Договоров поставки и услуг
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  НДС: {effectiveVatRate}% (Стандарт РФ 2026)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Формирование юридически выверенных договоров (A4) с печатью, факсимиле и расчетом спецификации
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher on mobile/tablet */}
            <div className="flex sm:hidden bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'form' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600' : 'text-slate-600'}`}
              >
                Параметры
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600' : 'text-slate-600'}`}
              >
                A4 Просмотр
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Скачать PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Печать</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Form Panel */}
          <div className={`w-full sm:w-[45%] lg:w-[40%] border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-5 space-y-5 bg-white dark:bg-slate-900 ${activeTab === 'preview' ? 'hidden sm:block' : 'block'}`}>
            
            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Шаблон договора:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {CONTRACT_TYPE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setContractTitle(p.title);
                      setScope(p.defaultScope);
                    }}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                      contractTitle === p.title
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">{p.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Contract Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Номер договора:
                </label>
                <input
                  type="text"
                  value={contractNumber}
                  onChange={e => setContractNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Дата заключения:
                </label>
                <input
                  type="text"
                  value={contractDate}
                  onChange={e => setContractDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Client Requisites */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Реквизиты Заказчика:
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Наименование организации (ООО/АО):
                </label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={e => setClientCompany(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    ИНН Заказчика:
                  </label>
                  <input
                    type="text"
                    value={clientInn}
                    onChange={e => setClientInn(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    КПП Заказчика:
                  </label>
                  <input
                    type="text"
                    value={clientKpp}
                    onChange={e => setClientKpp(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Подписант (ФИО в род. падеже):
                  </label>
                  <input
                    type="text"
                    value={clientSigner}
                    onChange={e => setClientSigner(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Должность подписанта:
                  </label>
                  <input
                    type="text"
                    value={clientSignerPost}
                    onChange={e => setClientSignerPost(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Commercial terms & VAT */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Налоговые и коммерческие условия:
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Режим налогообложения (НДС):
                  </label>
                  <select
                    value={vatMode}
                    onChange={e => setVatMode(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="standard">НДС {crmSettings?.defaultVatRate ?? 22}% (Стандарт РФ)</option>
                    <option value="export_zero">НДС 0% (Экспорт / ЕАЭС)</option>
                    <option value="no_vat">Без НДС (УСН / ст. 346.11 НК)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Авансовый платеж (%):
                  </label>
                  <select
                    value={advancePercent}
                    onChange={e => setAdvancePercent(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value={50}>50% аванс / 50% окончательный</option>
                    <option value={70}>70% аванс / 30% окончательный</option>
                    <option value={100}>100% предоплата</option>
                    <option value={30}>30% аванс / 70% по факту</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Срок поставки:
                  </label>
                  <input
                    type="text"
                    value={deliveryDays}
                    onChange={e => setDeliveryDays(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Срок гарантии:
                  </label>
                  <input
                    type="text"
                    value={warrantyMonths}
                    onChange={e => setWarrantyMonths(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Specification Items Editor */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Спецификация (Приложение №1):
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Добавить позицию
                </button>
              </div>

              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <input
                        type="text"
                        value={it.name}
                        onChange={e => handleUpdateItem(idx, 'name', e.target.value)}
                        className="flex-1 text-xs font-bold px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        placeholder="Наименование"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400">Кол-во:</span>
                        <input
                          type="number"
                          value={it.quantity}
                          min={1}
                          onChange={e => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Ед.:</span>
                        <input
                          type="text"
                          value={it.unit || 'шт.'}
                          onChange={e => handleUpdateItem(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Цена без НДС:</span>
                        <input
                          type="number"
                          value={it.price}
                          step={1000}
                          onChange={e => handleUpdateItem(idx, 'price', Number(e.target.value))}
                          className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stamp & Signature Toggles */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStamp}
                  onChange={e => setIncludeStamp(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Синяя печать организации</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSignature}
                  onChange={e => setIncludeSignature(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Факсимильная подпись</span>
              </label>
            </div>

          </div>

          {/* Right Live A4 Preview */}
          <div className={`flex-1 bg-slate-200/80 dark:bg-slate-950 p-6 overflow-y-auto flex flex-col items-center justify-start relative ${activeTab === 'form' ? 'hidden sm:flex' : 'flex'}`}>
            
            {/* Zoom Controls */}
            <div className="sticky top-0 z-20 mb-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-300 dark:border-slate-700 flex items-center gap-3 text-xs font-mono">
              <button
                type="button"
                onClick={() => setZoomScale(Math.max(0.6, zoomScale - 0.1))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                title="Уменьшить масштаб"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold">{Math.round(zoomScale * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomScale(Math.min(1.4, zoomScale + 0.1))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                title="Увеличить масштаб"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="px-1.5 py-0.5 text-[10px] text-blue-600 font-bold border border-blue-200 rounded"
              >
                100%
              </button>
            </div>

            {/* A4 Document Rendering Container */}
            <div 
              style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}
              className="shadow-2xl rounded-sm overflow-hidden"
              dangerouslySetInnerHTML={{ __html: generateContractHtml(contractPrintData) }}
            />
          </div>

        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-500">Итоговая стоимость:</span>
            <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              {totalWithVat.toLocaleString('ru-RU')} ₽
            </span>
            <span className="text-slate-400">
              (в т.ч. НДС {effectiveVatRate}%: {vatAmount.toLocaleString('ru-RU')} ₽)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSaveContractRecord}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Сохранить договор в CRM
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
