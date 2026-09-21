import React, { useState, useEffect } from 'react';
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
  Stamp
} from 'lucide-react';
import { ExtendedDeal, ProjectDocument } from '../../data/mockCrmData';
import { apiService } from '../../services/apiService';
import { 
  parseRussianLeaderGreeting, 
  downloadProposalPdf, 
  ProposalPrintData,
  ProposalPrintItem 
} from '../../utils/printProposal';

interface GenerateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: ExtendedDeal | null;
  onSaveDocumentToDeal?: (dealId: string, doc: ProjectDocument, proposalData: any) => void;
  currentManagerName?: string;
}

export const GenerateProposalModal: React.FC<GenerateProposalModalProps> = ({
  isOpen,
  onClose,
  deal,
  onSaveDocumentToDeal,
  currentManagerName = 'Некрасов С.Ю.'
}) => {
  if (!isOpen || !deal) return null;

  // Initial state setup from deal
  const defaultNumber = `ТКП-${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}-${deal.id.replace(/[^0-9]/g, '').slice(-3) || '001'}`;
  const todayFormatted = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

  const [proposalNumber, setProposalNumber] = useState(defaultNumber);
  const [proposalDate, setProposalDate] = useState(todayFormatted);
  const [customerCompany, setCustomerCompany] = useState(deal.companyName || deal.customerName || '');
  const [customerInn, setCustomerInn] = useState(deal.inn || '');
  const [customerKpp, setCustomerKpp] = useState('');
  
  // CEO & Greeting state
  const rawLeader = deal.customerName || '';
  const initialGreetingData = parseRussianLeaderGreeting(rawLeader);
  
  const [ceoPost, setCeoPost] = useState('Главному инженеру / Руководителю');
  const [ceoName, setCeoName] = useState(initialGreetingData.cleanFullName || rawLeader);
  const [greeting, setGreeting] = useState(initialGreetingData.greeting);
  
  // Procurement type: 'commercial' | '44fz' | '223fz'
  const [procurementType, setProcurementType] = useState<'commercial' | '44fz' | '223fz'>('commercial');
  
  // Proposal title
  const [proposalTitle, setProposalTitle] = useState(
    deal.serviceType || 'Поставка измерительного оборудования и комплекс метрологических услуг'
  );

  // Delivery & warranty
  const [deliveryDays, setDeliveryDays] = useState('5–15 рабочих дней со склада');
  const [warrantyMonths, setWarrantyMonths] = useState('24 месяца');
  
  // Manager
  const [managerName, setManagerName] = useState(deal.responsibleManager || currentManagerName);
  const [managerPost, setManagerPost] = useState('Ведущий инженер проектов «ДС-Инжиниринг»');
  const [managerPhone, setManagerPhone] = useState('+7 (846) 270-80-00');
  const [managerEmail, setManagerEmail] = useState('sales@ds-enginering.ru');
  const [includeStamp, setIncludeStamp] = useState(true);

  // DaData quick search inside modal
  const [dadataQuery, setDadataQuery] = useState('');
  const [isSearchingDadata, setIsSearchingDadata] = useState(false);
  const [dadataResults, setDadataResults] = useState<any[]>([]);
  const [showDadataDropdown, setShowDadataDropdown] = useState(false);
  const [dadataError, setDadataError] = useState<string | null>(null);

  // Generating PDF state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavedToDeal, setIsSavedToDeal] = useState(false);

  // Recalculate greeting whenever ceoName changes
  const handleCeoNameChange = (newName: string) => {
    setCeoName(newName);
    const parsed = parseRussianLeaderGreeting(newName, ceoPost);
    setGreeting(parsed.greeting);
  };

  // Convert deal items to proposal items
  const items: ProposalPrintItem[] = (deal.items && deal.items.length > 0)
    ? deal.items.map(it => ({
        name: it.name,
        category: it.category,
        quantity: it.quantity,
        unit: it.unit || 'шт.',
        price: it.price
      }))
    : [
        {
          name: deal.serviceType || 'Инжиниринговые услуги и поставка оборудования',
          category: 'Оборудование / Услуги',
          quantity: 1,
          unit: 'компл.',
          price: Math.round((deal.estimatedPrice || 250000) / 1.2) // remove VAT for base price
        }
      ];

  const subtotalWithoutVat = items.reduce((acc, it) => acc + (it.quantity * it.price), 0);
  const vatAmount = Math.round(subtotalWithoutVat * 0.20);
  const totalWithVat = subtotalWithoutVat + vatAmount;

  // DaData lookup handler
  const handleDadataSearch = async () => {
    if (!dadataQuery.trim()) return;
    setIsSearchingDadata(true);
    setDadataError(null);
    try {
      const res = await apiService.searchCompanyByDadata(dadataQuery.trim());
      if (res.success && res.data && res.data.length > 0) {
        setDadataResults(res.data);
        setShowDadataDropdown(true);
      } else {
        setDadataError('Организация не найдена в DaData');
        setDadataResults([]);
        setShowDadataDropdown(false);
      }
    } catch (err: any) {
      setDadataError(err.message || 'Ошибка поиска в DaData');
    } finally {
      setIsSearchingDadata(false);
    }
  };

  const applyDadataResult = (suggestion: any) => {
    const data = suggestion.data;
    if (suggestion.value || data.name?.short_with_opf) {
      setCustomerCompany(suggestion.value || data.name?.short_with_opf);
    }
    if (data.inn) setCustomerInn(data.inn);
    if (data.kpp) setCustomerKpp(data.kpp);
    
    // Automatically apply leader & greeting from DaData!
    if (data.management?.name) {
      const leaderName = data.management.name;
      setCeoName(leaderName);
      if (data.management.post) {
        setCeoPost(data.management.post);
      }
      const parsed = parseRussianLeaderGreeting(leaderName, data.management.post);
      setGreeting(parsed.greeting);
    } else if (data.fio?.name) {
      const fullFio = [data.fio.surname, data.fio.name, data.fio.patronymic].filter(Boolean).join(' ');
      setCeoName(fullFio);
      setCeoPost('Индивидуальный предприниматель');
      const parsed = parseRussianLeaderGreeting(fullFio);
      setGreeting(parsed.greeting);
    }

    setShowDadataDropdown(false);
    setDadataQuery('');
  };

  // Build the print payload
  const buildProposalData = (): ProposalPrintData => ({
    number: proposalNumber,
    date: proposalDate,
    customerCompany,
    customerInn,
    customerKpp,
    customerName: deal.customerName,
    ceoName,
    ceoPost,
    greeting,
    title: proposalTitle,
    items,
    budget: totalWithVat,
    procurementType,
    deliveryDays,
    warrantyMonths,
    assigneeName: managerName,
    assigneePost: managerPost,
    assigneePhone: managerPhone,
    assigneeEmail: managerEmail,
    includeStamp
  });

  // Action: Download PDF
  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const data = buildProposalData();
      await downloadProposalPdf(data);
      
      // Auto-save to deal documents if handler provided
      if (onSaveDocumentToDeal && !isSavedToDeal) {
        const newDoc: ProjectDocument = {
          id: `doc-tkp-${Date.now()}`,
          name: `ТКП_${proposalNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
          type: 'proposal',
          size: `${items.length > 3 ? '1.8' : '1.2'} MB`,
          date: new Date().toLocaleDateString('ru-RU'),
          author: managerName,
          status: 'Сформировано'
        };
        onSaveDocumentToDeal(deal.id, newDoc, data);
        setIsSavedToDeal(true);
      }
    } catch (err) {
      console.error('Error generating proposal PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-white rounded-lg sm:rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                  Генератор ТКП
                </span>
                <span className="text-xs font-mono text-slate-400">{deal.id}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                Коммерческое предложение для {deal.companyName || deal.customerName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-gray-900">
          
          {/* DaData Fast Search Bar */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Поиск контрагента в DaData (по ИНН или названию)</span>
              </span>
              <span className="text-[10px] text-blue-600 font-semibold hidden sm:inline">
                Автоматически подтягивает реквизиты, руководителя и обращение
              </span>
            </div>

            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={dadataQuery}
                    onChange={(e) => setDadataQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleDadataSearch())}
                    placeholder="Введите ИНН или название компании (напр. 6312004455 или ПАО «ОДК-Кузнецов»)..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDadataSearch}
                  disabled={isSearchingDadata || !dadataQuery.trim()}
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  {isSearchingDadata ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Найти</span>
                </button>
              </div>

              {dadataError && (
                <div className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{dadataError}</span>
                </div>
              )}

              {/* Suggestions Dropdown */}
              {showDadataDropdown && dadataResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm z-50 max-h-56 overflow-y-auto divide-y divide-gray-100">
                  {dadataResults.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyDadataResult(sug)}
                      className="w-full text-left p-2.5 hover:bg-blue-50 transition-colors cursor-pointer text-xs"
                    >
                      <div className="font-bold text-gray-900">{sug.value}</div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        <span>ИНН: {sug.data?.inn}</span>
                        {sug.data?.kpp && <span>КПП: {sug.data.kpp}</span>}
                        {sug.data?.management?.name && (
                          <span className="text-blue-700 font-semibold truncate">
                            Рук: {sug.data.management.name} ({sug.data.management.post || 'директор'})
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Document Requisites Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Номер ТКП
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={proposalNumber}
                  onChange={(e) => setProposalNumber(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:border-blue-600 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Дата документа
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={proposalDate}
                  onChange={(e) => setProposalDate(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:border-blue-600 outline-hidden"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Организация Заказчика
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  placeholder="ПАО «ОДК-Кузнецов»"
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:border-blue-600 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Leader & Personal Greeting Box (The Key Feature!) */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                    Руководитель и Персональное обращение
                  </h4>
                  <p className="text-[10px] text-blue-700">
                    Автоматический этикет деловой переписки по имени и отчеству
                  </p>
                </div>
              </div>

              {/* Greeting Badge */}
              <div className="px-4 py-1 bg-white border border-blue-300 rounded-full shadow-2xs flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>В ТКП: <span className="text-blue-600">{greeting}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Должность адресата
                </label>
                <input
                  type="text"
                  value={ceoPost}
                  onChange={(e) => setCeoPost(e.target.value)}
                  placeholder="Генеральному директору"
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  ФИО руководителя
                </label>
                <input
                  type="text"
                  value={ceoName}
                  onChange={(e) => handleCeoNameChange(e.target.value)}
                  placeholder="Королев Виктор Михайлович"
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                  Формула обращения
                </label>
                <input
                  type="text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Уважаемый Виктор Михайлович!"
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-blue-950 focus:border-blue-600 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Procurement Regulations & Regime (44-FZ / 223-FZ / Commercial) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Регламент и условия поставки (44-ФЗ / 223-ФЗ)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProcurementType('commercial')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  procurementType === 'commercial'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-slate-500'
                }`}
              >
                <div className="text-xs font-bold">Коммерческая поставка</div>
                <div className={`text-[10px] mt-0.5 ${procurementType === 'commercial' ? 'text-blue-100' : 'text-gray-500'}`}>
                  50% аванс, 50% по факту готовности к отгрузке
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProcurementType('44fz')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  procurementType === '44fz'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-slate-500'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Федеральный закон № 44-ФЗ</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${procurementType === '44fz' ? 'bg-blue-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>ГОЗ</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${procurementType === '44fz' ? 'text-blue-100' : 'text-gray-500'}`}>
                  Госзакупки, казначейство, ЕИС, «АРШИН»
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProcurementType('223fz')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  procurementType === '223fz'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-slate-500'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Федеральный закон № 223-ФЗ</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${procurementType === '223fz' ? 'bg-blue-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>Тендер</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${procurementType === '223fz' ? 'text-blue-100' : 'text-gray-500'}`}>
                  Положение заказчика, отсрочка, СТ-1
                </div>
              </button>
            </div>
          </div>

          {/* Specification Table Preview */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Спецификация позиций ({items.length})</span>
              </label>
              <span className="text-xs font-bold text-gray-500">
                Всего: <strong className="text-blue-700 font-extrabold">{totalWithVat.toLocaleString('ru-RU')} ₽</strong> с НДС
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full data-dense-table text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-2 w-8 text-center">№</th>
                    <th className="p-2">Наименование</th>
                    <th className="p-2 w-28">Категория</th>
                    <th className="p-2 w-16 text-center">Кол-во</th>
                    <th className="p-2 w-28 text-right">Цена за ед.</th>
                    <th className="p-2 w-28 text-right">Сумма (без НДС)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-2 text-center text-gray-400">{idx + 1}</td>
                      <td className="p-2 font-bold text-gray-900">{it.name}</td>
                      <td className="p-2 text-gray-500">{it.category || 'Оборудование'}</td>
                      <td className="p-2 text-center font-bold text-gray-800">{it.quantity} {it.unit || 'шт.'}</td>
                      <td className="p-2 text-right text-slate-500">{it.price.toLocaleString('ru-RU')} ₽</td>
                      <td className="p-2 text-right font-bold text-gray-900">{(it.quantity * it.price).toLocaleString('ru-RU')} ₽</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-gray-200 font-semibold text-slate-700">
                  <tr>
                    <td colSpan={5} className="p-2 text-right">Итого без НДС:</td>
                    <td className="p-2 text-right font-bold">{subtotalWithoutVat.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="p-2 text-right">НДС 20%:</td>
                    <td className="p-2 text-right font-bold text-slate-500">{vatAmount.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                  <tr className="bg-blue-50 text-blue-950 font-black text-sm">
                    <td colSpan={5} className="p-2 text-right">ИТОГО К ОПЛАТЕ (с НДС 20%):</td>
                    <td className="p-2 text-right text-blue-700">{totalWithVat.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Stamp & Manager Facsimile Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Stamp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">
                  Круглая печать и факсимиле подписи
                </div>
                <div className="text-[10px] text-gray-500">
                  Синяя гербовая печать ООО «ДС-Инжиниринг» с ОГРН 1206300057088 и подписью
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeStamp}
                onChange={(e) => setIncludeStamp(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-500">Вставить печать и подпись</span>
            </label>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-4 border-t border-gray-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Отмена
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Формирование PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Скачать официальное ТКП (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
