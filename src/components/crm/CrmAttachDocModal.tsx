import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  FilePlus, 
  Sparkles,
  Paperclip
} from 'lucide-react';
import { ProjectDocument, ExtendedDeal } from '../../data/mockCrmData';

interface CrmAttachDocModalProps {
  deal: ExtendedDeal;
  onClose: () => void;
  onAddDocument: (doc: ProjectDocument) => void;
}

export const CrmAttachDocModal: React.FC<CrmAttachDocModalProps> = ({
  deal,
  onClose,
  onAddDocument,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'upload' | 'generate'>('upload');
  const [docType, setDocType] = useState<ProjectDocument['type']>('proposal');
  const [docName, setDocName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill generated name when switching type in 'generate' mode
  const handleTypeChange = (type: ProjectDocument['type']) => {
    setDocType(type);
    const sanitizedCompany = deal.companyName.replace(/["«»]/g, '').replace(/\s+/g, '_');
    const dateStr = new Date().toLocaleDateString('ru-RU').replace(/\./g, '_');
    
    switch (type) {
      case 'proposal':
        setDocName(`ТКП_${sanitizedCompany}_${deal.serviceType.slice(0, 20).replace(/\s+/g, '_')}_${dateStr}.pdf`);
        setFileSize('1.8 MB');
        break;
      case 'nda':
        setDocName(`Соглашение_NDA_${sanitizedCompany}_подписано.pdf`);
        setFileSize('750 KB');
        break;
      case 'contract':
        setDocName(`Договор_Поставки_${sanitizedCompany}_ДС-2026.pdf`);
        setFileSize('2.4 MB');
        break;
      case 'spec':
        setDocName(`Акт_метрологического_аудита_${sanitizedCompany}.pdf`);
        setFileSize('1.2 MB');
        break;
      case 'certificate':
        setDocName(`Свидетельство_поверки_${deal.clientEquipment?.serialNumber || '2026'}.pdf`);
        setFileSize('920 KB');
        break;
      case 'drawing':
        setDocName(`Контрольный_чертеж_${sanitizedCompany}_STEP.step`);
        setFileSize('4.5 MB');
        break;
    }
  };

  const handleFileSelect = (file: File) => {
    setError('');
    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    
    setDocName(file.name);
    setFileSize(formattedSize);

    // Auto-detect type
    const lower = file.name.toLowerCase();
    if (lower.includes('ткп') || lower.includes('кп') || lower.includes('proposal')) setDocType('proposal');
    else if (lower.includes('nda') || lower.includes('соглашен') || lower.includes('конфиденц')) setDocType('nda');
    else if (lower.includes('договор') || lower.includes('контракт') || lower.includes('contract')) setDocType('contract');
    else if (lower.includes('акт') || lower.includes('специфик') || lower.includes('тз') || lower.includes('spec')) setDocType('spec');
    else if (lower.includes('поверк') || lower.includes('сертифик') || lower.includes('паспорт')) setDocType('certificate');
    else if (lower.includes('чертеж') || lower.includes('step') || lower.includes('iges') || lower.includes('dwg')) setDocType('drawing');

    // Read as Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      setError('Пожалуйста, укажите имя документа или выберите файл');
      return;
    }

    const newDoc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name: docName.trim(),
      type: docType,
      size: fileSize || '1.2 MB',
      date: new Date().toLocaleDateString('ru-RU'),
      fileDataUrl: fileDataUrl,
      status: 'Действует'
    };

    onAddDocument(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-sm border border-gray-200 overflow-hidden flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="p-5 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Прикрепить документ к сделке</h2>
              <p className="text-xs text-gray-400 truncate max-w-xs">{deal.companyName} • {deal.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'upload' ? 'bg-white text-gray-900 shadow-xs' : 'text-slate-500 hover:text-gray-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Загрузить с диска</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('generate');
                handleTypeChange(docType);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'generate' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Сформировать бланк</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {mode === 'upload' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/60' 
                    : docName 
                    ? 'border-emerald-400 bg-emerald-50/40' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                {docName ? (
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-gray-900 break-all">{docName}</div>
                    <div className="text-[11px] text-gray-500">{fileSize} • Нажмите, чтобы выбрать другой</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-gray-800">
                      Перетащите файл сюда или <span className="text-blue-600 underline">выберите на компьютере</span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      PDF, DOCX, XLSX, STEP, IGES, PNG, JPG (до 25 МБ)
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Категория и тип документа <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'proposal', label: 'ТКП / КП' },
                { id: 'nda', label: 'Соглашение NDA' },
                { id: 'contract', label: 'Договор' },
                { id: 'spec', label: 'Акт / Спецификация' },
                { id: 'certificate', label: 'Поверка / Сертификат' },
                { id: 'drawing', label: 'Чертежи / CAD' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleTypeChange(item.id as any)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-left truncate cursor-pointer ${
                    docType === item.id
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold ring-1 ring-blue-400'
                      : 'bg-white border-gray-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Document Name input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Название документа в системе <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Например: ТКП_Mitutoyo_Самара_2026.pdf"
              className="w-full px-4.5 py-2.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 font-medium"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-500 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Прикрепить к сделке</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
