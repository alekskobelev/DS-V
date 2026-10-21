import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
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
  ShieldCheck,
  Save,
  Cpu,
  Server,
  Sparkles
} from 'lucide-react';
import { LicenseItem, AttachedDocument } from '../../types';
import { useApp } from '../../context/AppContext';
import { AccountFileModal } from './AccountFileModal';
import { AccountDocViewerModal } from './AccountDocViewerModal';

interface AccountLicenseModalProps {
  license?: LicenseItem | null;
  onClose: () => void;
  onSave: (license: LicenseItem) => void;
}

const LICENSE_TYPES: LicenseItem['type'][] = [
  'Сетевая лицензия PDM',
  'Локальный Dongle USB',
  'Sentinel HASP HL',
  'FlexLM Network',
  'Облачная подписка'
];

const LICENSE_STATUSES: LicenseItem['status'][] = [
  'Активна',
  'Истекает',
  'Требуется обновление',
  'Заблокирована'
];

export const AccountLicenseModal: React.FC<AccountLicenseModalProps> = ({
  license,
  onClose,
  onSave,
}) => {
  const isEditing = !!license;

  const [title, setTitle] = useState(license?.title || '');
  const [productName, setProductName] = useState(license?.productName || 'TopSolid 7');
  const [type, setType] = useState<LicenseItem['type']>(license?.type || 'Сетевая лицензия PDM');
  const [status, setStatus] = useState<LicenseItem['status']>(license?.status || 'Активна');
  const [company, setCompany] = useState(license?.company || 'АО «Авиаагрегат-Самара»');
  const [haspId, setHaspId] = useState(license?.haspId || `#${Math.floor(100000 + Math.random() * 900000)}-SAMARA`);
  const [seatsCount, setSeatsCount] = useState(license?.seatsCount || '4 CAD / 2 CAM 5-Axis');
  const [licenseServer, setLicenseServer] = useState(license?.licenseServer || '192.168.1.50:1947');
  const [hardwareModel, setHardwareModel] = useState(license?.hardwareModel || 'Рабочая станция / Станок ЧПУ');
  const [validUntil, setValidUntil] = useState(license?.validUntil || 'Бессрочно (Перманентная)');
  const [supportUntil, setSupportUntil] = useState(license?.supportUntil || '15.01.2027');
  const [notes, setNotes] = useState(license?.notes || '');
  const [dealId, setDealId] = useState(license?.dealId || '');
  const [contractId, setContractId] = useState(license?.contractId || '');
  const { deals, contracts } = useApp();
  const [files, setFiles] = useState<AttachedDocument[]>(license?.files || []);

  // Modals for attached files
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<AttachedDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<AttachedDocument | null>(null);
  const [error, setError] = useState('');

  const handleAddOrUpdateFile = (doc: AttachedDocument) => {
    if (editingDoc) {
      setFiles(files.map(f => f.id === doc.id ? doc : f));
    } else {
      setFiles([...files, doc]);
    }
    setEditingDoc(null);
  };

  const handleDeleteFile = (docId: string) => {
    setFiles(files.filter(f => f.id !== docId));
  };

  const handleGenerateV2c = () => {
    const v2cDoc: AttachedDocument = {
      id: `v2c-${Date.now()}`,
      name: `Update_${productName.replace(/\s+/g, '_')}_${haspId.replace(/[#\s]/g, '')}.v2c`,
      category: 'Файл лицензии (.v2c / .lic)',
      size: '28 KB',
      uploadedAt: new Date().toLocaleDateString('ru-RU'),
      uploadedBy: 'Центр лицензирования ДС‑Инжиниринг',
    };
    setFiles([...files, v2cDoc]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Заполните наименование лицензии / ПО');
      return;
    }

    const savedLicense: LicenseItem = {
      id: license?.id || `lic-${Date.now()}`,
      title: title.trim(),
      productName: productName.trim(),
      type: type,
      status: status,
      company: company.trim(),
      haspId: haspId.trim(),
      seatsCount: seatsCount.trim(),
      licenseServer: licenseServer.trim(),
      hardwareModel: hardwareModel.trim(),
      validUntil: validUntil.trim(),
      supportUntil: supportUntil.trim(),
      notes: notes.trim(),
      files: files,
      dealId: dealId || undefined,
      contractId: contractId || undefined,
    };

    onSave(savedLicense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-sm border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-teal-950 to-gray-900 text-white flex items-center justify-between border-b border-teal-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? `Редактирование лицензии «${license?.title}»` : 'Регистрация новой лицензии / ключа защиты'}
              </h2>
              <p className="text-xs text-teal-200">
                Управление ключами HASP HL, Sentinel, сетевыми серверами PDM и файлами .v2c
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
          
          {/* Row 1: Title & Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Наименование пакета лицензии <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="TopSolid 7 PDM Server (v7.18)"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Программный продукт / Оборудование <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="TopSolid 7 / PolyWorks"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Row 2: Type, Status, Company */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Тип лицензирования
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LicenseItem['type'])}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-teal-500"
              >
                {LICENSE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Статус лицензии
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LicenseItem['status'])}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-teal-500"
              >
                {LICENSE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Предприятие / Держатель
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="АО «Авиаагрегат»"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Row 3: HASP ID, Seats, Server */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                ID Ключа / HASP ID
              </label>
              <input
                type="text"
                value={haspId}
                onChange={(e) => setHaspId(e.target.value)}
                placeholder="#849204-SAMARA"
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs font-bold text-teal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Рабочих мест / Модули
              </label>
              <input
                type="text"
                value={seatsCount}
                onChange={(e) => setSeatsCount(e.target.value)}
                placeholder="8 CAD / 4 CAM 5-Axis"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Сервер лицензий / IP
              </label>
              <input
                type="text"
                value={licenseServer}
                onChange={(e) => setLicenseServer(e.target.value)}
                placeholder="192.168.1.50:1947"
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Row 4: Validity & Tech Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Срок действия лицензии
              </label>
              <input
                type="text"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                placeholder="Бессрочно (Перманентная)"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Срок технической поддержки
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

          {/* Attached Files Section */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Файлы лицензий, дампы ключей и драйверы ({files.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateV2c}
                  className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer border border-teal-200"
                  title="Сгенерировать файл обновления ключа .v2c"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Создать .v2c</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingDoc(null); setFileModalOpen(true); }}
                  className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить файл</span>
                </button>
              </div>
            </div>

            {files.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 border border-dashed border-gray-300 rounded-xl text-gray-500 text-xs">
                Файлы лицензий не прикреплены. Нажмите «Создать .v2c» или «Добавить файл», чтобы прикрепить лицензионный файл или драйвер.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {files.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-gray-200 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <KeyRound className="w-4 h-4" />
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
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
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
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Сохранить лицензию' : 'Зарегистрировать лицензию'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* File Submodal */}
      {fileModalOpen && (
        <AccountFileModal
          existingDoc={editingDoc}
          parentTitle={`Лицензия: ${title || productName}`}
          defaultCategories={[
            'Файл лицензии (.v2c / .lic)',
            'Дамп ключа защиты HASP',
            'Драйвер ключа / Утилита',
            'Инструкция по установке',
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
          parentTitle={`Лицензия: ${title} (${haspId})`}
          parentEntityNumber={haspId}
          onClose={() => setViewingDoc(null)}
          onDelete={handleDeleteFile}
          canDelete={true}
        />
      )}
    </div>
  );
};
