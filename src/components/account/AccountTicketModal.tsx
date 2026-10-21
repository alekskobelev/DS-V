import React, { useState } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Paperclip, 
  FileText, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Download,
  ShieldAlert, ShieldCheck,
  Save,
  HelpCircle
} from 'lucide-react';
import { SupportTicketItem, TicketMessage, AttachedDocument } from '../../types';
import { useApp } from '../../context/AppContext';
import { AccountFileModal } from './AccountFileModal';
import { AccountDocViewerModal } from './AccountDocViewerModal';

interface AccountTicketModalProps {
  ticket?: SupportTicketItem | null;
  canManage: boolean;
  currentUser: any;
  onClose: () => void;
  onSave: (ticket: SupportTicketItem) => void;
}

const TICKET_STATUS_LABELS: Record<SupportTicketItem['status'], { label: string; color: string }> = {
  open: { label: 'Ожидает ответа', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  in_progress: { label: 'В работе у инженера', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  resolved: { label: 'Решено', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  closed: { label: 'Закрыто / В архиве', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const ENGINEERS = [
  'Скобелев Александр Сергеевич (TopSolid / Постпроцессоры)',
  'Ярыш Иван Владимирович (PolyWorks / КИМ)',
  'Ярыш Александр Владимирович (3D-сканирование)',
  'Морозов Владимир Георгиевич (Оснастка / Штампы)',
  'Дежурный инженер техподдержки'
];

export const AccountTicketModal: React.FC<AccountTicketModalProps> = ({
  ticket,
  canManage,
  currentUser,
  onClose,
  onSave,
}) => {
  const isEditing = !!ticket;

  const [subject, setSubject] = useState(ticket?.subject || '');
  const [product, setProduct] = useState(ticket?.product || 'TopSolid 7');
  const [clientCompany, setClientCompany] = useState(ticket?.clientCompany || currentUser?.company || 'Предприятие');
  const [clientName, setClientName] = useState(ticket?.clientName || currentUser?.fullName || 'Специалист');
  const [status, setStatus] = useState<SupportTicketItem['status']>(ticket?.status || 'open');
  const [priority, setPriority] = useState<SupportTicketItem['priority']>(ticket?.priority || 'Средний');
  const [assignedEngineer, setAssignedEngineer] = useState(ticket?.assignedEngineer || 'Скобелев Александр Сергеевич');
  const [dealId, setDealId] = useState(ticket?.dealId || '');
  const [contractId, setContractId] = useState(ticket?.contractId || '');
  const { deals, contracts } = useApp();
  const [description, setDescription] = useState(ticket?.description || '');
  
  const [messages, setMessages] = useState<TicketMessage[]>(ticket?.messages || []);
  const [newMessageText, setNewMessageText] = useState('');
  const [attachments, setAttachments] = useState<AttachedDocument[]>(ticket?.attachments || []);

  // File Modals
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<AttachedDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<AttachedDocument | null>(null);
  const [error, setError] = useState('');

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      author: currentUser?.fullName || 'Инженер техподдержки',
      authorRole: currentUser?.role === 'client' ? 'client' : 'engineer',
      text: newMessageText.trim(),
      date: `Сегодня, ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
    };

    setMessages([...messages, newMsg]);
    setNewMessageText('');
  };

  const handleAddOrUpdateFile = (doc: AttachedDocument) => {
    if (editingDoc) {
      setAttachments(attachments.map(a => a.id === doc.id ? doc : a));
    } else {
      setAttachments([...attachments, doc]);
    }
    setEditingDoc(null);
  };

  const handleDeleteFile = (docId: string) => {
    setAttachments(attachments.filter(a => a.id !== docId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Укажите тему обращения');
      return;
    }

    const savedTicket: SupportTicketItem = {
      id: ticket?.id || `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject.trim(),
      product: product.trim(),
      clientCompany: clientCompany.trim(),
      clientName: clientName.trim(),
      date: ticket?.date || new Date().toLocaleDateString('ru-RU'),
      status: status,
      priority: priority,
      description: description.trim(),
      assignedEngineer: assignedEngineer,
      lastReply: messages.length > 0 ? messages[messages.length - 1].text : description.slice(0, 80),
      messages: messages,
      attachments: attachments,
      dealId: dealId || undefined,
      contractId: contractId || undefined,
    };

    onSave(savedTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-sm border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 text-white flex items-center justify-between gap-3 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded shrink-0">
                  {ticket?.id || 'Новое обращение'}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${TICKET_STATUS_LABELS[status].color} shrink-0`}>
                  {TICKET_STATUS_LABELS[status].label}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-1 truncate max-w-full">
                {isEditing ? ticket?.subject : 'Подача заявки в службу технической поддержки'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer shrink-0 ml-1"
            title="Закрыть окно"
            aria-label="Закрыть окно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Main Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Продукт / Оборудование <span className="text-red-500">*</span>
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="TopSolid 7">TopSolid 7 (CAD/CAM/PDM)</option>
                <option value="PolyWorks|Inspector">PolyWorks|Inspector</option>
                <option value="Hexagon ROMER Arm">Мобильная КИМ Hexagon</option>
                <option value="3D-сканер Shining 3D / ScanLine">3D-сканер Shining 3D / ScanLine</option>
                <option value="Постпроцессор ЧПУ">Постпроцессор ЧПУ (Fanuc, Siemens, Heidenhain)</option>
                <option value="КИМ PMT Future">Стационарная КИМ PMT</option>
                <option value="Другое">Другой технический вопрос</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SupportTicketItem['priority'])}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Низкий">Низкий (Плановый вопрос)</option>
                <option value="Средний">Средний (Рабочий вопрос)</option>
                <option value="Высокий">Высокий (Остановка работ)</option>
                <option value="Критический">Критический (Сбой производства)</option>
              </select>
            </div>

            {canManage ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Статус обработки (Инженер)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SupportTicketItem['status'])}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">Ожидает ответа</option>
                  <option value="in_progress">В работе у инженера</option>
                  <option value="resolved">Решено</option>
                  <option value="closed">Закрыто</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Статус
                </label>
                <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-slate-500">
                  {TICKET_STATUS_LABELS[status].label}
                </div>
              </div>
            )}
          </div>

          {/* Subject & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Тема обращения <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ошибка выравнивания по базам RPS в PolyWorks"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {canManage ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Ответственный инженер
                </label>
                <select
                  value={assignedEngineer}
                  onChange={(e) => setAssignedEngineer(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900"
                >
                  {ENGINEERS.map((eng) => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Предприятие / Заявитель
                </label>
                <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-slate-500">
                  {clientCompany} • {clientName}
                </div>
              </div>
            )}
          </div>

          
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Привязка к договору</label>
                  <select
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    disabled={!canManage && contractId !== ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-800 disabled:bg-slate-50 disabled:text-gray-500"
                  >
                    <option value="">Без привязки (Общий вопрос)</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>{c.number} {c.title}</option>
                    ))}
                  </select>
                </div>
                {canManage && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Привязка к сделке (CRM)</label>
                    <select
                      value={dealId}
                      onChange={(e) => setDealId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-800"
                    >
                      <option value="">Не выбрано</option>
                      {deals.map((d, idx) => (
                        <option key={`${d.id}-${idx}`} value={d.id}>{d.id} - {d.companyName} ({d.customerName})</option>
                      ))}
                    </select>
                  </div>
                )}

                
                {/* Warranty Check */}
                {contractId && contracts.find(c => c.id === contractId) && (
                  (() => {
                    const linkedContract = contracts.find(c => c.id === contractId);
                    if (!linkedContract?.supportUntil) return null;
                    
                    // Parse date "DD.MM.YYYY"
                    const parts = linkedContract.supportUntil.split('.');
                    if (parts.length === 3) {
                      const supportDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                      if (supportDate < new Date()) {
                        return (
                          <div className="col-span-full mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in">
                            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-bold text-red-900">Срок технической поддержки истек</div>
                              <div className="text-xs text-red-700 mt-0.5">
                                Гарантия по договору {linkedContract.number} закончилась {linkedContract.supportUntil}. Данная заявка может быть рассмотрена на коммерческой основе после согласования стоимости работ.
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="col-span-full mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in fade-in">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-bold text-emerald-900">Оборудование на гарантии</div>
                              <div className="text-xs text-emerald-700 mt-0.5">
                                Техническая поддержка по договору {linkedContract.number} действует до {linkedContract.supportUntil}.
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()
                )}

                {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Подробное описание проблемы / Код ошибки <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите последовательность действий, стойку станка, модель измерительного прибора или версию ПО..."
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 resize-none"
            />
          </div>

          {/* Attached Files Section */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Прикрепленные файлы (логи, скриншоты, 3D-модели) ({attachments.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setEditingDoc(null); setFileModalOpen(true); }}
                className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Прикрепить файл</span>
              </button>
            </div>

            {attachments.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 border border-dashed border-gray-300 rounded-xl text-gray-500 text-xs">
                Файлы не прикреплены. Вы можете прикрепить архив проекта, лог ошибок или скриншот.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attachments.map((doc) => (
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
                        title="Редактировать"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(doc.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Messages History */}
          {isEditing && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  История переписки и консультаций ({messages.length})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto p-3 bg-slate-50/80 rounded-xl border border-gray-200">
                {messages.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-3">Пока нет сообщений в чате обращения.</p>
                ) : (
                  messages.map((m) => {
                    const isStaff = m.authorRole === 'engineer' || m.authorRole === 'admin';
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          isStaff
                            ? 'bg-blue-50/90 border border-blue-200 ml-4'
                            : 'bg-white border border-gray-200 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-bold ${isStaff ? 'text-blue-900' : 'text-gray-900'}`}>
                            {m.author} {isStaff && '(ДС‑Инжиниринг)'}
                          </span>
                          <span className="text-gray-400 text-[10px]">{m.date}</span>
                        </div>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Написать ответ инженеру или комментарий к заявке..."
                  className="flex-1 p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMessage(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddMessage}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ответить</span>
                </button>
              </div>
            </div>
          )}

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
              <span>{isEditing ? 'Сохранить заявку' : 'Подать обращение'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* File Submodal */}
      {fileModalOpen && (
        <AccountFileModal
          existingDoc={editingDoc}
          parentTitle={`Заявка: ${subject || 'Сервисное обращение'}`}
          defaultCategories={[
            'Лог ошибки / Скриншот',
            'CAD-модель / Чертеж',
            'Файл постпроцессора',
            'Протокол измерений',
            'Прочее'
          ]}
          onClose={() => setFileModalOpen(false)}
          onSave={handleAddOrUpdateFile}
        />
      )}

      {/* Doc Viewer Submodal */}
      {viewingDoc && (
        <AccountDocViewerModal
          document={viewingDoc}
          parentTitle={`Заявка ${ticket?.id || ''}: ${subject}`}
          parentEntityNumber={ticket?.id}
          onClose={() => setViewingDoc(null)}
          onDelete={handleDeleteFile}
          canDelete={true}
        />
      )}
    </div>
  );
};
