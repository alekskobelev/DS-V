import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Download, 
  Paperclip, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Save,
  Briefcase
} from 'lucide-react';
import { ProjectContract, AttachedDocument, CurrencyCode, getCurrencySymbol } from '../../types';
import { AccountFileModal } from './AccountFileModal';
import { AccountDocViewerModal } from './AccountDocViewerModal';

interface AccountContractModalProps {
  contract?: ProjectContract | null;
  onClose: () => void;
  onSave: (contract: ProjectContract) => void;
}

const CONTRACT_STATUSES: ProjectContract['status'][] = [
  'Действует',
  'Выполнен (На гарантии)',
  'Сдан в эксплуатацию',
  'В процессе подписания',
  'Приостановлен'
];

export const AccountContractModal: React.FC<AccountContractModalProps> = ({
  contract,
  onClose,
  onSave,
}) => {
  const isEditing = !!contract;

  const [number, setNumber] = useState(contract?.number || `ДОГ-2026/${Math.floor(100 + Math.random() * 900)}`);
  const [title, setTitle] = useState(contract?.title || '');
  const [company, setCompany] = useState(contract?.company || '');
  const [date, setDate] = useState(contract?.date || new Date().toLocaleDateString('ru-RU'));
  const [status, setStatus] = useState<ProjectContract['status']>(contract?.status || 'Действует');
  const [supportUntil, setSupportUntil] = useState(contract?.supportUntil || '31.12.2026');
  const [curator, setCurator] = useState(contract?.curator || 'Скобелев Александр Сергеевич');
  const [curatorPhone, setCuratorPhone] = useState(contract?.curatorPhone || '+7 (937) 984-61-51');
  const [amount, setAmount] = useState(contract?.amount || 'По договору');
  const [currency, setCurrency] = useState<CurrencyCode>(contract?.currency || 'RUB');
  const [scope, setScope] = useState(contract?.scope || '');
  const [documents, setDocuments] = useState<AttachedDocument[]>(contract?.documents || []);

  // Modals for attached files
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<AttachedDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<AttachedDocument | null>(null);
  const [error, setError] = useState('');

  const handleAddOrUpdateDoc = (doc: AttachedDocument) => {
    if (editingDoc) {
      setDocuments(documents.map(d => d.id === doc.id ? doc : d));
    } else {
      setDocuments([...documents, doc]);
    }
    setEditingDoc(null);
  };

  const handleDeleteDoc = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      setError('Заполните наименование проекта и компанию-заказчика');
      return;
    }

    const savedContract: ProjectContract = {
      id: contract?.id || `cnt-${Date.now()}`,
      number: number.trim(),
      title: title.trim(),
      company: company.trim(),
      date: date.trim(),
      status: status,
      statusColor: status === 'Действует' ? 'emerald' : status === 'Выполнен (На гарантии)' ? 'blue' : status === 'В процессе подписания' ? 'amber' : 'gray',
      supportUntil: supportUntil.trim(),
      curator: curator.trim(),
      curatorPhone: curatorPhone.trim(),
      amount: amount.trim(),
      currency: currency,
      scope: scope.trim(),
      documents: documents,
      dealId: contract?.dealId,
      dealTitle: contract?.dealTitle,
    };

    onSave(savedContract);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-sm border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? `Редактирование договора № ${contract?.number}` : 'Создание нового договора / проекта'}
              </h2>
              <p className="text-xs text-blue-200">
                Управление проектной документацией, статусом и гарантийными обязательствами
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Row 1: Number & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Номер договора <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="ДОГ-2026/014"
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Статус проекта
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectContract['status'])}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                {CONTRACT_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Дата договора
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="15.01.2026"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Row 2: Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Наименование проекта / предмета договора <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Внедрение TopSolid 7 + 2 лицензии TopSolid'CAM 7"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Заказчик / Предприятие <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="АО «Авиаагрегат-Самара»"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 3: Curator & Support Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Куратор проекта (ДС‑Инжиниринг)
              </label>
              <input
                type="text"
                value={curator}
                onChange={(e) => setCurator(e.target.value)}
                placeholder="Скобелев Александр Сергеевич"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Телефон куратора
              </label>
              <input
                type="text"
                value={curatorPhone}
                onChange={(e) => setCuratorPhone(e.target.value)}
                placeholder="+7 (937) 984-61-51"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Срок техподдержки / гарантии
              </label>
              <input
                type="text"
                value={supportUntil}
                onChange={(e) => setSupportUntil(e.target.value)}
                placeholder="15.01.2027"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Amount & Currency */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center justify-between">
              <span>Сумма договора (с НДС 22%)</span>
              <span className="text-[10px] text-gray-500 font-normal">Валюта договора:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Например, 4 850 000 или «По договору»"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="px-2.5 py-2 border border-gray-300 rounded-xl bg-gray-50 font-bold text-xs text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none shrink-0"
              >
                <option value="RUB">₽ RUB (Рубли)</option>
                <option value="USD">$ USD (Доллар США)</option>
                <option value="EUR">€ EUR (Евро)</option>
                <option value="CNY">¥ CNY (Юани)</option>
              </select>
            </div>

            {/* 3-point VAT breakdown if numeric */}
            {(() => {
              const num = parseInt((amount || '').replace(/\D/g, ''), 10);
              if (!num || isNaN(num) || num <= 0) return null;
              const sym = getCurrencySymbol(currency);
              const withoutVat = Math.round(num / 1.22);
              const vat = Math.round(withoutVat * 0.22);
              return (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>ИТОГО без НДС:</span>
                    <span className="font-mono font-bold text-gray-800">{withoutVat.toLocaleString('ru-RU')} {sym}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>В том числе НДС 22%:</span>
                    <span className="font-mono font-bold text-blue-600">{vat.toLocaleString('ru-RU')} {sym}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-slate-200 pt-1">
                    <span>ИТОГО с учетом НДС 22%:</span>
                    <span className="font-mono font-black text-emerald-800">{num.toLocaleString('ru-RU')} {sym}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Scope / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Краткое описание объема работ / комплектации
            </label>
            <textarea
              rows={2}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Поставка ПО, калибровочные испытания, разработка кинематической модели станка и постпроцессора..."
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 resize-none"
            />
          </div>

          {/* Attached Documents Section */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Прикрепленные документы проекта ({documents.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setEditingDoc(null); setFileModalOpen(true); }}
                className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить файл</span>
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="p-5 text-center bg-slate-50 border border-dashed border-gray-300 rounded-xl text-gray-500 text-xs">
                К договору пока не прикреплено ни одного документа. Нажмите «Добавить файл», чтобы загрузить скан договора, спецификацию или акт.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-gray-200 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 truncate" title={doc.name}>
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-2">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span className="font-mono">{doc.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewingDoc(doc)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Просмотр"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingDoc(doc); setFileModalOpen(true); }}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Редактировать параметры файла"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Удалить файл"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Сохранить договор' : 'Создать договор'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Submodal: File Add/Edit */}
      {fileModalOpen && (
        <AccountFileModal
          existingDoc={editingDoc}
          parentTitle={`Договор № ${number}`}
          onClose={() => setFileModalOpen(false)}
          onSave={handleAddOrUpdateDoc}
        />
      )}

      {/* Submodal: Document Viewer */}
      {viewingDoc && (
        <AccountDocViewerModal
          document={viewingDoc}
          parentTitle={`Договор ${number} (${company})`}
          parentEntityNumber={number}
          onClose={() => setViewingDoc(null)}
          onDelete={handleDeleteDoc}
          canDelete={true}
        />
      )}
    </div>
  );
};
