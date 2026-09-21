import React, { useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  User, 
  Trash2, 
  FileCheck
} from 'lucide-react';
import { AttachedDocument } from '../../types';
import { DsLogo } from '../common/DsLogo';

interface AccountDocViewerModalProps {
  document: AttachedDocument;
  parentTitle?: string;
  parentEntityNumber?: string;
  onClose: () => void;
  onDelete?: (docId: string) => void;
  canDelete?: boolean;
}

export const AccountDocViewerModal: React.FC<AccountDocViewerModalProps> = ({
  document: doc,
  parentTitle = 'Документ проекта',
  parentEntityNumber,
  onClose,
  onDelete,
  canDelete = false,
}) => {
  const printableRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (doc.fileUrl) {
      const link = window.document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      return;
    }

    // Generate formatted official text/HTML document
    const content = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${doc.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #111; line-height: 1.6; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
    .title { font-size: 20px; font-weight: bold; color: #1e3a8a; }
    .meta { font-size: 13px; color: #555; margin-top: 5px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th, .table td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    .table th { background: #f3f4f6; }
    .stamp-box { margin-top: 40px; border: 2px dashed #3b82f6; padding: 15px; width: 300px; text-align: center; color: #1d4ed8; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header" style="display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px;">
    <img src="${window.location.origin}/logo.svg" width="48" height="48" alt="ДС‑Инжиниринг" style="vertical-align: middle; object-fit: contain;" />
    <div>
      <div class="title">ООО «ДС‑Инжиниринг» — Официальный документ</div>
      <div class="meta">443013, г. Самара, Московское шоссе, д. 17 | ИНН 6316200000 / КПП 631601001 | Тел: +7 (846) 954-02-92</div>
    </div>
  </div>
  <h2>${doc.name}</h2>
  <p><strong>Основание / Привязка:</strong> ${parentTitle} ${parentEntityNumber ? `(${parentEntityNumber})` : ''}</p>
  <p><strong>Категория:</strong> ${doc.category}</p>
  <p><strong>Дата регистрации:</strong> ${doc.uploadedAt}</p>
  <p><strong>Размер файла:</strong> ${doc.size}</p>
  <hr />
  <div style="margin: 25px 0;">
    ${printableRef.current?.innerHTML || '<p>Официальный электронный документ зарегистрирован в едином реестре документации ООО «ДС‑Инжиниринг».</p>'}
  </div>
  <div class="stamp-box">
    ООО «ДС‑Инжиниринг»<br />
    Служба документооборота<br />
    г. Самара
  </div>
</body>
</html>`;

    const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = doc.name.endsWith('.pdf') ? doc.name.replace('.pdf', '.html') : `${doc.name}.html`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">{doc.name}</h2>
              <p className="text-xs text-gray-400 truncate">
                {parentTitle} • {doc.category} • {doc.size}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              title="Печать документа"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors flex items-center gap-1 text-xs font-bold px-4 cursor-pointer shadow-xs"
              title="Скачать файл"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Скачать</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-100/60 space-y-6">
          {/* Document Sheet */}
          <div 
            ref={printableRef}
            className="bg-white rounded-xl p-6 sm:p-10 shadow-md border border-gray-200/90 text-gray-900 space-y-6 max-w-2xl mx-auto"
          >
            {/* Sheet Top Branding */}
            <div className="flex items-start justify-between border-b-2 border-blue-600 pb-4">
              <div className="flex items-center gap-3">
                <DsLogo size={44} />
                <div>
                  <div className="text-base font-black text-blue-900 tracking-tight">ООО «ДС‑Инжиниринг»</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Инжиниринговые решения, внедрение CAD/CAM и поставка метрологического оборудования
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    г. Самара, Московское шоссе, 17 • ИНН 6316200000 • Тел: +7 (846) 954-02-92
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                  {doc.category}
                </span>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">{doc.uploadedAt}</div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-2">
              <h1 className="text-lg sm:text-xl font-black text-gray-900">{doc.name}</h1>
              <p className="text-xs text-gray-500 mt-1">
                К проекту / основанию: <span className="font-semibold text-slate-500">{parentTitle}</span>
              </p>
            </div>

            {/* Structured Stub Content */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-b border-gray-100 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 block">Категория документа:</span>
                  <strong className="text-gray-800">{doc.category}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Размер файла:</span>
                  <strong className="text-gray-800">{doc.size}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Дата регистрации:</span>
                  <strong className="text-gray-800">{doc.uploadedAt}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Статус валидации:</span>
                  <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Проверен и утвержден
                  </span>
                </div>
              </div>

              <p>
                Настоящий документ является неотъемлемой частью договорных обязательств и технической документации в рамках сопровождения проекта ООО «ДС‑Инжиниринг». Все параметры, спецификации и условия согласованы в установленном порядке.
              </p>
            </div>

            {/* Registration Stamp Box */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 space-y-0.5">
                <div>Зарегистрировал: <span className="font-semibold text-slate-500">{doc.uploadedBy || 'Инженерный отдел'}</span></div>
                <div>Электронный архив: <span className="font-mono text-slate-500">ID-{doc.id}</span></div>
              </div>

              <div className="border-2 border-dashed border-blue-600 bg-blue-50/70 p-3 rounded-xl text-center text-blue-900 w-full sm:w-64 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-blue-800">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>ДОКУМЕНТ УТВЕРЖДЕН</span>
                </div>
                <div className="text-[10px] text-blue-700">ООО «ДС‑ИНЖИНИРИНГ»</div>
                <div className="text-[9px] text-blue-600 font-mono">Рег. номер: DS-DOC-{doc.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-gray-200 flex items-center justify-between">
          <div>
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Вы действительно хотите удалить файл «${doc.name}»?`)) {
                    onDelete(doc.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить файл</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
