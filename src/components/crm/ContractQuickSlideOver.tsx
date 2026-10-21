import React, { useState } from 'react';
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
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ProjectContract, AttachedDocument, CurrencyCode, getCurrencySymbol } from '../../types';
import { STAFF_DIRECTORY } from '../../utils/staffDirectory';
import { downloadContractPdf, printContract } from '../../utils/printContract';
import { numberToWordsRu } from '../../utils/numberToWordsRu';
import { useApp } from '../../context/AppContext';

interface ContractQuickSlideOverProps {
  contract: ProjectContract | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateContract?: (updated: ProjectContract) => void;
  onOpenFullEditor?: (contract: ProjectContract) => void;
  onOpenGenerator?: (contract: ProjectContract) => void;
  onCloneContract?: (contract: ProjectContract) => void;
}

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: 'Исполняется', label: 'Исполняется', color: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' },
  { value: 'Действует', label: 'Действует', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
  { value: 'Выполнен (На гарантии)', label: 'Выполнен (На гарантии)', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' },
  { value: 'Сдан в эксплуатацию', label: 'Сдан в эксплуатацию', color: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800' },
  { value: 'Подписан', label: 'Подписан', color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' },
  { value: 'В процессе подписания', label: 'В процессе подписания', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  { value: 'На согласовании', label: 'На согласовании', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  { value: 'Проект', label: 'Проект', color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' },
  { value: 'Приостановлен', label: 'Приостановлен', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
  { value: 'Завершен', label: 'Завершен', color: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
];

export const ContractQuickSlideOver: React.FC<ContractQuickSlideOverProps> = ({
  contract,
  isOpen,
  onClose,
  onUpdateContract,
  onOpenFullEditor,
  onOpenGenerator,
  onCloneContract
}) => {
  const { showToast, isAdmin } = useApp();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<AttachedDocument['category']>('Договор и приложения');
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  if (!isOpen || !contract) return null;

  // Financial calculations
  const rawAmountNumber = contract.amount ? parseFloat(contract.amount.replace(/[^0-9.]/g, '')) || 0 : 0;
  const isNoVat = contract.vatMode === 'no_vat';
  const isExportZero = contract.vatMode === 'export_zero' || contract.vatRate === 0;
  const vatRate = isNoVat ? 0 : isExportZero ? 0 : (contract.vatRate !== undefined ? contract.vatRate : 22);
  const subtotalWithoutVat = Math.round(rawAmountNumber / (1 + vatRate / 100));
  const vatAmount = (isNoVat || isExportZero) ? 0 : rawAmountNumber - subtotalWithoutVat;
  const currencySymbol = getCurrencySymbol(contract.currency || 'RUB');
  const amountInWords = rawAmountNumber > 0 ? numberToWordsRu(rawAmountNumber) : 'Сумма определяется спецификацией';

  // Fast Status Change
  const handleSelectStatus = (newStatus: string) => {
    let colorVal: ProjectContract['statusColor'] = 'blue';
    if (newStatus === 'Действует') colorVal = 'emerald';
    else if (newStatus === 'Выполнен (На гарантии)') colorVal = 'blue';
    else if (newStatus === 'Сдан в эксплуатацию') colorVal = 'gray';
    else if (newStatus === 'В процессе подписания' || newStatus === 'На согласовании') colorVal = 'amber';
    else if (newStatus === 'Проект') colorVal = 'purple';
    else if (newStatus === 'Приостановлен') colorVal = 'red';

    const updated = {
      ...contract,
      status: newStatus,
      statusColor: colorVal
    };
    if (onUpdateContract) onUpdateContract(updated);
    setIsStatusDropdownOpen(false);
    showToast(`Статус договора изменен на «${newStatus}»`);
  };

  // Fast Manager Change
  const handleSelectCurator = (managerName: string) => {
    const matchedStaff = Object.values(STAFF_DIRECTORY).find(s => s.shortName === managerName || s.fullName === managerName);
    const updated = {
      ...contract,
      curator: managerName,
      curatorPhone: matchedStaff?.phone || contract.curatorPhone
    };
    if (onUpdateContract) onUpdateContract(updated);
    showToast(`Куратором назначен «${managerName}»`);
  };

  // Add Document directly in slide-over
  const handleAddQuickDocument = () => {
    if (!newDocName.trim()) {
      showToast('Введите наименование прикрепляемого документа');
      return;
    }

    const newDoc: AttachedDocument = {
      id: `doc_${Date.now()}`,
      name: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      category: newDocCategory,
      size: '1.4 MB',
      uploadedAt: new Date().toLocaleDateString('ru-RU'),
      uploadedBy: contract.curator || 'Администратор'
    };

    const updated = {
      ...contract,
      documents: [...(contract.documents || []), newDoc]
    };

    if (onUpdateContract) onUpdateContract(updated);
    setNewDocName('');
    setIsAddingDoc(false);
    showToast(`Документ «${newDoc.name}» успешно прикреплен`);
  };

  // Remove Document
  const handleRemoveDoc = (docId: string) => {
    const updated = {
      ...contract,
      documents: (contract.documents || []).filter(d => d.id !== docId)
    };
    if (onUpdateContract) onUpdateContract(updated);
    showToast('Документ удален из состава договора');
  };

  // Direct PDF Download
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadContractPdf({
        number: contract.number,
        date: contract.date,
        title: contract.title,
        clientCompany: contract.company,
        amount: rawAmountNumber,
        currency: contract.currency || 'RUB',
        vatRate: vatRate,
        vatMode: contract.vatMode,
        scope: contract.scope,
        curatorName: contract.curator,
        curatorPhone: contract.curatorPhone,
        includeStamp: true,
        includeSignature: true
      });
      showToast(`PDF договора ${contract.number} успешно сформирован`);
    } catch (err) {
      console.error(err);
      showToast('Ошибка при формировании PDF документа');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Direct Print
  const handleDirectPrint = () => {
    printContract({
      number: contract.number,
      date: contract.date,
      title: contract.title,
      clientCompany: contract.company,
      amount: rawAmountNumber,
      currency: contract.currency || 'RUB',
      vatRate: vatRate,
      vatMode: contract.vatMode,
      scope: contract.scope,
      curatorName: contract.curator,
      curatorPhone: contract.curatorPhone,
      includeStamp: true,
      includeSignature: true
    });
  };

  const currentStatusConfig = STATUS_OPTIONS.find(s => s.value === contract.status) || STATUS_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
          
          {/* Top Sticky Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {contract.number}
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    от {contract.date}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-md">
                  {contract.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${currentStatusConfig.color}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {contract.status}
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1 uppercase tracking-wider">
                      Сменить статус договора:
                    </div>
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectStatus(opt.value)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          contract.status === opt.value
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${opt.color.includes('emerald') ? 'bg-emerald-500' : opt.color.includes('sky') ? 'bg-sky-500' : opt.color.includes('amber') ? 'bg-amber-500' : opt.color.includes('purple') ? 'bg-purple-500' : 'bg-slate-400'}`} />
                          {opt.label}
                        </span>
                        {contract.status === opt.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Закрыть панель (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Quick Actions Action Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-center gap-1.5 shadow-2xs group"
              >
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Скачать PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDirectPrint}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-center gap-1.5 shadow-2xs group"
              >
                <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Печать A4</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenGenerator && onOpenGenerator(contract)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 transition-all text-center gap-1.5 shadow-2xs group"
              >
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Генератор A4</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenFullEditor && onOpenFullEditor(contract)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-all text-center gap-1.5 shadow-2xs group"
              >
                <Edit3 className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Редактировать</span>
              </button>
            </div>

            {/* Financial Card with Russian 2026 VAT 22% Specification */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Стоимость договора и расчет НДС:
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
                  <Percent className="w-3 h-3" />
                  {isExportZero ? 'НДС 0% (Экспорт)' : isNoVat ? 'Без НДС (УСН)' : `Ставка НДС: ${vatRate}%`}
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                  {rawAmountNumber > 0 ? rawAmountNumber.toLocaleString('ru-RU') : 'По договору'}
                </span>
                <span className="text-lg font-bold text-blue-400">
                  {rawAmountNumber > 0 ? currencySymbol : ''}
                </span>
              </div>

              <p className="text-xs text-slate-300 italic mb-4 font-mono leading-relaxed">
                «{amountInWords}»
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                <div>
                  <div className="text-slate-400 text-[11px]">Сумма без НДС:</div>
                  <div className="font-bold text-slate-200">
                    {subtotalWithoutVat > 0 ? `${subtotalWithoutVat.toLocaleString('ru-RU')} ${currencySymbol}` : 'По расчету'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">
                    {isExportZero ? 'НДС 0%:' : isNoVat ? 'НДС (не облагается):' : `Сумма НДС (${vatRate}%):`}
                  </div>
                  <div className="font-bold text-blue-400">
                    {vatAmount > 0 ? `${vatAmount.toLocaleString('ru-RU')} ${currencySymbol}` : (isExportZero || isNoVat ? '0 ₽' : 'Включен')}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Curator Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Контрагент / Заказчик:
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {contract.company}
                </div>
                {contract.dealId && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">
                    <Briefcase className="w-3 h-3" />
                    <span>Сделка: {contract.dealId} ({contract.dealTitle || 'Инжиниринг'})</span>
                  </div>
                )}
              </div>

              {/* Curator */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Куратор договора:
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {contract.curator}
                </div>
                {contract.curatorPhone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{contract.curatorPhone}</span>
                  </div>
                )}
                {contract.supportUntil && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Гарантия до: {contract.supportUntil}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scope / Terms */}
            {contract.scope && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                  <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Предмет и условия выполнения:
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {contract.scope}
                </p>
              </div>
            )}

            {/* Attached Documents and Scans */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Прикрепленные документы ({contract.documents?.length || 0}):
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(!isAddingDoc)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Прикрепить файл
                </button>
              </div>

              {/* Add document form */}
              {isAddingDoc && (
                <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2.5 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    Добавление скана/файла в карточку договора:
                  </div>
                  <input
                    type="text"
                    value={newDocName}
                    onChange={e => setNewDocName(e.target.value)}
                    placeholder="Например: Скан договора с подписями.pdf или УПД № 12.pdf"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={newDocCategory}
                      onChange={e => setNewDocCategory(e.target.value as any)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="Договор и приложения">Договор и приложения</option>
                      <option value="Акты и накладные">Акты и накладные</option>
                      <option value="Счета и оплаты">Счета и оплаты</option>
                      <option value="Сертификаты и паспорта">Сертификаты и паспорта</option>
                      <option value="Технические задания">Технические задания</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAddingDoc(false)}
                        className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={handleAddQuickDocument}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                      >
                        Прикрепить
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents List */}
              {contract.documents && contract.documents.length > 0 ? (
                <div className="space-y-2">
                  {contract.documents.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {doc.name}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                            <span>{doc.category || 'Документ'}</span>
                            <span>•</span>
                            <span>{doc.size || '1.2 MB'}</span>
                            <span>•</span>
                            <span>{doc.uploadedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                          title="Удалить файл"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  К договору пока не прикреплены сканы документов. Нажмите «Прикрепить файл» для загрузки.
                </div>
              )}
            </div>

          </div>

          {/* Bottom Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => onCloneContract && onCloneContract(contract)}
              className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              Дублировать договор
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Закрыть
              </button>
              <button
                type="button"
                onClick={() => onOpenGenerator && onOpenGenerator(contract)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Генератор A4
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
