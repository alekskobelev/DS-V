import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
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
  Phone,
  FileCheck,
  Tag,
  Layers,
  Edit3,
  Trash2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Coins,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { CommercialProposal, ProposalVersion, CurrencyCode, getCurrencySymbol } from '../../types';
import { DsLogo } from '../common/DsLogo';
import { getStaffMemberInfo } from '../../utils/staffDirectory';
import { CrmDocumentationModal } from './CrmDocumentationModal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { EMBLEM_DATA_URL } from '../../utils/emblemBase64';
import { parseRussianLeaderGreeting } from '../../utils/printProposal';
import { numberToWordsRu } from '../../utils/numberToWordsRu';
import { handleUnifiedA4ExportAction, calculateTableVat22, HARDCODED_DEFAULT_VAT_RATE } from '../../utils/a4DocumentExportHandler';

interface ProposalDocumentViewerModalProps {
  proposal: CommercialProposal;
  version?: ProposalVersion;
  onClose: () => void;
  onSelectVersion?: (version: ProposalVersion) => void;
  onEdit?: (proposal: CommercialProposal) => void;
  onDelete?: (proposalId: string) => void;
  canEdit?: boolean;
  isAdmin?: boolean;
}

export const ProposalDocumentViewerModal: React.FC<ProposalDocumentViewerModalProps> = ({
  proposal,
  version,
  onClose,
  onSelectVersion,
  onEdit,
  onDelete,
  canEdit = true,
  isAdmin = true
}) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docCurrency, setDocCurrency] = useState<CurrencyCode>(proposal.currency || 'RUB');
  const [isDocOpen, setIsDocOpen] = useState(false);
  const staff = getStaffMemberInfo(proposal.preparedBy);

  // Dynamic VAT handling with hardcoded 22% rate verification
  const curSym = getCurrencySymbol(docCurrency);
  const vatMode = (proposal.vatMode || (proposal.vatRate === 0 ? 'export_zero' : 'standard')) as 'standard' | 'no_vat' | 'export_zero' | 'custom';
  const effectiveVatRate = proposal.vatRate !== undefined ? proposal.vatRate : HARDCODED_DEFAULT_VAT_RATE;

  const rawSubtotal = proposal.subtotalWithoutVat || (
    proposal.amount 
      ? (vatMode === 'no_vat' || vatMode === 'export_zero' || effectiveVatRate === 0 
          ? proposal.amount 
          : Math.round(proposal.amount / (1 + effectiveVatRate / 100)))
      : 0
  );

  const vatCalc = calculateTableVat22(rawSubtotal, vatMode, effectiveVatRate);
  const totalWithoutVat = vatCalc.subtotal;
  const vatAmount = proposal.vatAmount !== undefined && proposal.vatAmount > 0 ? proposal.vatAmount : vatCalc.vatAmount;
  const totalWithVat = proposal.totalWithVat || (totalWithoutVat + vatAmount);
  const vatLineLabel = vatCalc.vatLabel;
  const totalLineLabel = vatCalc.totalLabel;
  const vatNotice = vatCalc.vatNotice;

  // Default to the first version or generate dummy version if none
  const isNeutral = Boolean(proposal.isNeutralTemplate || proposal.templateMode === 'impersonal');
  const currentVersion: ProposalVersion = version || (proposal.versions && proposal.versions.length > 0 ? proposal.versions[0] : {
    id: 'default_v1',
    version: 1,
    name: isNeutral 
      ? `${(proposal.toCompany || 'КП').replace(/[\s/]/g, '_')}_Коммерческое_предложение.pdf`
      : `${(proposal.outgoingNumber || proposal.id || 'doc').replace(/\//g, '_')}_ТКП.pdf`,
    size: '1.8 MB',
    uploadedAt: proposal.date || new Date().toISOString().split('T')[0],
    uploadedBy: proposal.preparedBy || 'Менеджер'
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const effectiveGreeting = proposal.greeting || (
    proposal.contactPerson 
      ? parseRussianLeaderGreeting(proposal.contactPerson).greeting 
      : 'Уважаемый Алексей Михайлович!'
  );
  const wordsRu = numberToWordsRu(totalWithVat);

  const handlePrint = async () => {
    try {
      await handleUnifiedA4ExportAction('print', {
        container: printableRef.current || document.body
      });
    } catch (err) {
      console.error('Unified print error:', err);
      window.focus();
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (currentVersion.fileDataUrl) {
      const link = window.document.createElement('a');
      link.href = currentVersion.fileDataUrl;
      link.download = currentVersion.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      return;
    }

    if (!printableRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const safeNumber = (proposal.outgoingNumber || 'ТКП').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
      const safeCompany = (proposal.toCompany || 'Заказчик').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_').slice(0, 25);
      const filename = `ТКП_${safeNumber}_${safeCompany}.pdf`;

      await handleUnifiedA4ExportAction('pdf', {
        container: printableRef.current.parentElement || printableRef.current,
        filename
      });
    } catch (err) {
      console.error('PDF export error:', err);
      handleDownloadHtml();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    if (currentVersion.fileDataUrl) {
      const link = window.document.createElement('a');
      link.href = currentVersion.fileDataUrl;
      link.download = currentVersion.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      return;
    }

    // Generate formatted HTML download
    const isAkp = Boolean(proposal.isAlternative);
    const isPartnerAkp = isAkp && (proposal.akpPurpose === 'partner_tender' || !proposal.akpPurpose);
    const hasIncoming = Boolean(proposal.hasIncomingRef || proposal.incomingNumber);

    // Build document images HTML if available
    const imagesHtml = (proposal.documentImages && proposal.documentImages.length > 0)
      ? `<div style="margin: 20px 0; border: 1px solid #000; padding: 12px; border-radius: 4px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 10px; text-transform: uppercase;">Иллюстрации и схемы оборудования</div>
          <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
            ${proposal.documentImages.map(img => `
              <div style="text-align: center; flex: 1 1 ${img.widthPercent ? `${img.widthPercent - 5}%` : '45%'}; min-width: 200px; max-width: 100%;">
                <img src="${img.url}" alt="${img.title || 'Изображение'}" style="max-width: 100%; max-height: 260px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 4px;" />
                ${img.title ? `<div style="font-size: 11px; font-weight: bold; margin-top: 4px; color: #000;">${img.title}</div>` : ''}
                ${img.caption ? `<div style="font-size: 10px; color: #475569; margin-top: 2px;">${img.caption}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>`
      : '';

    const docHtml = isNeutral ? `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Коммерческое предложение - ${proposal.toCompany}</title>
  <style>
    body { font-family: "Times New Roman", Times, Georgia, serif; margin: 40px; color: #000000; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 2px solid #000000; padding-bottom: 15px; margin-bottom: 15px; display: flex; align-items: start; justify-content: space-between; }
    .logo { font-size: 18px; font-weight: bold; color: #000000; letter-spacing: 0.5px; text-transform: uppercase; }
    .sublogo { font-size: 11px; color: #333333; margin-top: 4px; }
    .doc-title { font-size: 16px; font-weight: bold; color: #000000; text-align: center; margin-top: 20px; margin-bottom: 15px; text-transform: uppercase; }
    .akp-badge { display: inline-block; background: #334155; color: white; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; }
    .content-box { border: 1px solid #000000; border-radius: 4px; padding: 14px; margin-bottom: 20px; }
    .footer { margin-top: 30px; border-top: 1px solid #000000; padding-top: 15px; display: flex; justify-content: space-between; align-items: flex-end; position: relative; min-height: 100px; font-size: 11px; color: #000000; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</div>
      <div class="sublogo">
        Спецификация высокоточного оборудования и метрологических услуг
      </div>
    </div>
    <div style="text-align: right; font-size: 12px;">
      <div style="font-weight: bold;">${proposal.toCompany}</div>
      <div>${proposal.contactPerson || ''}</div>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 15px; border-bottom: 1px solid #cccccc; padding-bottom: 8px;">
    <div>
      <div style="font-weight: bold;">Дата: ${proposal.date} г.</div>
      ${hasIncoming ? `<div style="font-weight: bold; margin-top: 2px;">В ответ на запрос ${proposal.incomingNumber ? `№ ${proposal.incomingNumber}` : ''} ${proposal.incomingDate ? `от ${proposal.incomingDate} г.` : ''}</div>` : ''}
    </div>
    <div style="font-size: 11px; color: #555; font-style: italic;">
      Обезличенная форма коммерческого предложения
    </div>
  </div>

  ${isAkp ? `<div class="akp-badge">${isPartnerAkp ? 'АКП для партнеров (Тендерный запрос)' : 'АКП (Альтернативная поставка)'}</div>` : ''}

  <div class="doc-title">
    ${isAkp ? (isPartnerAkp ? 'АЛЬТЕРНАТИВНОЕ КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ ДЛЯ ПАРТНЕРОВ' : 'АЛЬТЕРНАТИВНОЕ КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ (ПОСТАВКА)') : 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ'}
  </div>

  <div class="content-box">
    <div style="font-weight: bold; margin-bottom: 6px;">Предмет и спецификация коммерческого предложения:</div>
    <p style="font-size: 13px; font-weight: normal; margin: 0;">${proposal.content}</p>
  </div>

  ${imagesHtml}

  ${proposal.amount ? `
  <div style="margin-top: 20px; border: 1px solid #000000; border-radius: 4px; overflow: hidden; font-size: 12px;">
    <div style="background: #f8fafc; padding: 8px 12px; font-weight: bold; color: #000000; border-bottom: 1px solid #000000;">
      РАСЧЕТ СТОИМОСТИ КОММЕРЧЕСКОГО ПРЕДЛОЖЕНИЯ
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 12px; color: #000000; border-bottom: 1px solid #000000;">ИТОГО без НДС:</td>
        <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #000000; font-family: monospace; border-bottom: 1px solid #000000;">
          ${totalWithoutVat.toLocaleString('ru-RU')} ${curSym}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; color: #000000; border-bottom: 1px solid #000000;">${vatLineLabel}</td>
        <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #000000; font-family: monospace; border-bottom: 1px solid #000000;">
          ${vatAmount.toLocaleString('ru-RU')} ${curSym}
        </td>
      </tr>
      <tr style="background: #f8fafc; font-weight: bold;">
        <td style="padding: 10px 12px; color: #000000; font-size: 13px;">${totalLineLabel}</td>
        <td style="padding: 10px 12px; text-align: right; color: #000000; font-size: 14px; font-family: monospace;">
          ${totalWithVat.toLocaleString('ru-RU')} ${curSym}
        </td>
      </tr>
    </table>
  </div>
  ` : ''}

  <div style="margin-top: 15px; font-size: 12px; border: 1px solid #000000; padding: 10px; border-radius: 4px;">
    <div>• <strong>Срок действия коммерческого предложения:</strong> до ${proposal.validUntil || '14 календарных дней'} г.</div>
    <div>• <strong>Условия оплаты:</strong> 50% авансовый платеж, 50% по готовности к отгрузке.</div>
    <div>• <strong>Базис поставки:</strong> со склада Поставщика (DDP склад Заказчика).</div>
    <div>• <strong>Гарантийный срок:</strong> 12–24 месяца с момента ввода в эксплуатацию.</div>
    ${proposal.note ? `<div>• <strong>Примечание:</strong> ${proposal.note}</div>` : ''}
  </div>

  <div class="footer">
    <div style="text-align: left;">
      <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">Исполнитель</div>
      <div style="padding-top: 24px; font-size: 12px;">
        ____________________ / ${proposal.impersonalSignerName || proposal.executorName || '____________________'}
      </div>
    </div>
    <div style="position: absolute; left: 50%; transform: translateX(-50%); bottom: 0; text-align: center;">
      <div style="width: 90px; height: 90px; border-radius: 50%; border: 2px solid #2563eb; color: #1e40af; font-size: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-6deg); line-height: 1.2; margin: 0 auto; background: rgba(255,255,255,0.7); text-align: center;">
        <span>ОТДЕЛ СБЫТА И ПРОДАЖ</span>
        <span style="font-weight: bold; font-size: 11px; margin: 2px 0;">М. П.</span>
        <span>ДЛЯ ДОКУМЕНТОВ</span>
      </div>
    </div>
    <div style="min-width: 150px;"></div>
  </div>
</body>
</html>` : `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${proposal.outgoingNumber} - ${proposal.toCompany}</title>
  <style>
    body { font-family: "Times New Roman", Times, Georgia, serif; margin: 40px; color: #000000; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 2px solid #000000; padding-bottom: 15px; margin-bottom: 15px; display: flex; align-items: start; justify-content: space-between; }
    .logo { font-size: 20px; font-weight: bold; color: #000000; letter-spacing: 0.5px; }
    .sublogo { font-size: 11px; color: #000000; font-weight: normal; margin-top: 4px; }
    .doc-title { font-size: 16px; font-weight: bold; color: #000000; text-align: center; margin-top: 20px; margin-bottom: 15px; text-transform: uppercase; }
    .akp-badge { display: inline-block; background: #334155; color: white; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .meta-table td { padding: 6px 10px; border: 1px solid #000000; font-size: 12px; }
    .meta-label { font-weight: bold; background: #f8fafc; color: #000000; width: 28%; }
    .content-box { border: 1px solid #000000; border-radius: 4px; padding: 14px; margin-bottom: 20px; }
    .footer { margin-top: 30px; border-top: 1px solid #000000; padding-top: 15px; display: flex; justify-content: space-between; font-size: 11px; color: #000000; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; align-items: center; gap: 14px;">
      <img src="${window.location.origin}/images/emblem.jpg" width="52" height="52" alt="ДС‑Инжиниринг" style="vertical-align: middle; object-fit: contain;" />
      <div>
        <div class="logo">ООО «ДС‑ИНЖИНИРИНГ»</div>
        <div class="sublogo">
          Инжиниринговый центр и поставка координатно-измерительных систем<br />
          ИНН 6312154320 • КПП 631201001 • Самара, ул. Свободы, 198 • Тел: +7 (846) 954-02-92 • info@ds-engineering.ru
        </div>
      </div>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 12px; margin-bottom: 15px; border-bottom: 1px solid #cccccc; padding-bottom: 8px;">
    <div>
      <div style="font-weight: bold;">Исх. № ${(proposal.outgoingNumber || '001').replace(/^(исх\.?\s*№?\s*)+/gi, '')}</div>
      <div style="font-weight: bold; margin-top: 2px;">от ${proposal.date} г.</div>
      ${hasIncoming ? `<div style="font-size: 11px; margin-top: 2px;">На № ${proposal.incomingNumber || '—'} ${proposal.incomingDate ? `от ${proposal.incomingDate} г.` : ''}</div>` : ''}
    </div>
    <div style="text-align: right; font-size: 12px; max-width: 300px;">
      <div style="font-weight: bold;">${proposal.toCompany}</div>
      ${proposal.contactPerson ? `<div>${proposal.contactPerson}</div>` : ''}
    </div>
  </div>

  ${isAkp ? `<div class="akp-badge">${isPartnerAkp ? 'АКП для партнеров (Тендерный запрос)' : 'АКП (Альтернативная поставка)'}</div>` : ''}

  <div class="doc-title">
    ${isAkp ? (isPartnerAkp ? 'АЛЬТЕРНАТИВНОЕ КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ ДЛЯ ПАРТНЕРОВ' : 'АЛЬТЕРНАТИВНОЕ КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ (ПОСТАВКА)') : 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ'}
  </div>

  <div class="content-box">
    <div style="font-weight: bold; margin-bottom: 6px;">Предмет и спецификация коммерческого предложения:</div>
    <p style="font-size: 13px; font-weight: normal; margin: 0;">${proposal.content}</p>
  </div>

  ${imagesHtml}

  ${proposal.amount ? `
  <div style="margin-top: 20px; border: 1px solid #000000; border-radius: 4px; overflow: hidden; font-size: 12px;">
    <div style="background: #f8fafc; padding: 8px 12px; font-weight: bold; color: #000000; border-bottom: 1px solid #000000;">
      РАСЧЕТ СТОИМОСТИ КОММЕРЧЕСКОГО ПРЕДЛОЖЕНИЯ
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 12px; color: #000000; border-bottom: 1px solid #000000;">ИТОГО без НДС:</td>
        <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #000000; font-family: monospace; border-bottom: 1px solid #000000;">
          ${totalWithoutVat.toLocaleString('ru-RU')} ${curSym}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; color: #000000; border-bottom: 1px solid #000000;">${vatLineLabel}</td>
        <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #000000; font-family: monospace; border-bottom: 1px solid #000000;">
          ${vatAmount.toLocaleString('ru-RU')} ${curSym}
        </td>
      </tr>
      <tr style="background: #f8fafc; font-weight: bold;">
        <td style="padding: 10px 12px; color: #000000; font-size: 13px;">${totalLineLabel}</td>
        <td style="padding: 10px 12px; text-align: right; color: #000000; font-size: 14px; font-family: monospace;">
          ${totalWithVat.toLocaleString('ru-RU')} ${curSym}
        </td>
      </tr>
    </table>
  </div>
  ` : ''}

  <div style="margin-top: 15px; font-size: 12px; border: 1px solid #000000; padding: 10px; border-radius: 4px;">
    <div>• <strong>Срок действия коммерческого предложения:</strong> до ${proposal.validUntil || '14 календарных дней'} г.</div>
    <div>• <strong>Условия оплаты:</strong> 50% авансовый платеж, 50% по готовности к отгрузке.</div>
    <div>• <strong>Гарантийный срок:</strong> 12–24 месяца с момента ввода в эксплуатацию.</div>
    ${proposal.note ? `<div>• <strong>Примечание:</strong> ${proposal.note}</div>` : ''}
  </div>

  <div class="footer" style="display: flex; justify-content: space-between; align-items: flex-end; position: relative; border-top: 1px solid #000; padding-top: 15px; margin-top: 25px; min-height: 100px;">
    <div>
      <div><strong>Генеральный директор</strong></div>
      <div>ООО «ДС‑Инжиниринг»</div>
      <div style="padding-top: 18px;"><strong>Некрасов С.Ю.</strong></div>
    </div>
    <div style="position: absolute; left: 50%; transform: translateX(-50%); bottom: 0; text-align: center;">
      <div style="width: 90px; height: 90px; border-radius: 50%; border: 2px solid #2563eb; color: #1e40af; font-size: 8px; display: flex; align-items: center; justify-content: center; transform: rotate(-12deg); line-height: 1.2; margin: 0 auto; background: rgba(255,255,255,0.7);">
        ООО «ДС-ИНЖИНИРИНГ»<br>М.П.<br>ОГРН 1126312004520
      </div>
    </div>
    <div style="text-align: right;">
      <div>Исполнитель: <strong>${proposal.executorName || proposal.preparedBy || staff.fullName || staff.shortName}</strong></div>
      <div style="font-size: 11px;">Тел: +7 (846) 954-02-92 • info@ds-engineering.ru</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = isNeutral
      ? `${(proposal.toCompany || 'КП').replace(/[\s/]/g, '_')}_Коммерческое_предложение.html`
      : `${proposal.outgoingNumber.replace(/\//g, '_')}_ДС_Инжиниринг.html`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-sm overflow-hidden border border-gray-100 flex flex-col mt-4 sm:mt-10 mb-10 max-h-[90vh]">
        {/* Top Header - Multi-Row Grid to prevent overlapping */}
        <div className="px-4 py-3 bg-gray-900 text-white flex flex-col gap-2.5 shrink-0">
          {/* Row 1: Document Number, Badges, Date, and Top-Right Close Button */}
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                proposal.isAlternative 
                  ? (proposal.akpPurpose === 'partner_tender' || !proposal.akpPurpose ? 'bg-slate-700 text-slate-200' : 'bg-blue-600/30 text-blue-400')
                  : 'bg-blue-600/30 text-blue-400'
              }`}>
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm sm:text-base text-white tracking-wide">
                    {isNeutral ? 'Обезличенное КП' : proposal.outgoingNumber}
                  </span>
                  {isNeutral ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">
                      Обезличенный шаблон (White-label)
                    </span>
                  ) : proposal.isAlternative ? (
                    (proposal.akpPurpose === 'partner_tender' || !proposal.akpPurpose) ? (
                      <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 border border-slate-600 text-[10px] font-extrabold uppercase tracking-wider">
                        АКП (Тендер)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-blue-900/80 text-blue-300 border border-blue-700 text-[10px] font-extrabold uppercase tracking-wider">
                        АКП (Альтернатива)
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 border border-blue-800 text-[10px] font-bold uppercase tracking-wider">
                      Основное КП
                    </span>
                  )}
                  <span className="text-xs text-gray-400">от {proposal.date}</span>
                </div>
                <p className="text-xs text-gray-300 truncate mt-0.5">
                  {proposal.toCompany} • {currentVersion.name}
                </p>
              </div>
            </div>

            {/* Pinned Close Button in header */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Закрыть окно"
              aria-label="Закрыть окно"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Row 2: Action Controls Toolbar (Currency + Action Buttons) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800 text-xs">
            {/* Currency selector */}
            <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700 text-xs shrink-0">
              <Coins className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-gray-400 text-[10px] uppercase font-bold">Валюта:</span>
              <select
                value={docCurrency}
                onChange={(e) => setDocCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-white font-bold cursor-pointer outline-none text-xs"
                title="Выбор валюты коммерческого предложения"
              >
                <option value="RUB" className="bg-gray-800 text-white">Рубли (₽)</option>
                <option value="USD" className="bg-gray-800 text-white">USD ($)</option>
                <option value="EUR" className="bg-gray-800 text-white">EUR (€)</option>
                <option value="CNY" className="bg-gray-800 text-white">CNY (¥)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {canEdit && onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(proposal);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                  title="Редактировать параметры КП"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Редактировать</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDocOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                title="Открыть документацию и регламент работы с КП"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Справка</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                title="Печать документа"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span>Печать</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                title="Скачать коммерческое предложение в PDF"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>{isGeneratingPdf ? 'Экспорт...' : 'PDF'}</span>
              </button>

              {(isAdmin || canEdit) && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                  title="Удалить коммерческое предложение"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Version Switcher if multiple versions exist */}
        {proposal.versions && proposal.versions.length > 1 && (
          <div className="px-6 py-2.5 bg-gray-100 border-b border-gray-200 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs shrink-0">
            <span className="text-gray-500 font-bold text-[11px] shrink-0 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Версии файла ({proposal.versions.length}):
            </span>
            <div className="flex items-center gap-2">
              {proposal.versions.map((ver) => {
                const isActive = ver.id === currentVersion.id;
                return (
                  <button
                    key={ver.id}
                    onClick={() => onSelectVersion && onSelectVersion(ver)}
                    className={`px-4 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-white text-slate-500 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    <span>v{ver.version}</span>
                    <span className="text-[10px] opacity-80 truncate max-w-[120px]">{ver.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Document Body / Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100">
          <div 
            ref={printableRef}
            style={{ fontFamily: '"Times New Roman", Times, Georgia, serif', color: '#000000' }}
            className="a4-page-render max-w-3xl mx-auto bg-white rounded-lg p-6 sm:p-10 shadow-sm border border-black/20 text-black relative"
          >
            {/* Watermark for AKP */}
            {proposal.isAlternative && (
              <div className="mb-6 p-3 rounded bg-slate-100 border border-black flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                  АКП
                </div>
                <div className="text-xs">
                  <div className="font-bold text-black uppercase tracking-wider">
                    {proposal.akpPurpose === 'partner_tender' ? 'АКП для партнеров (Тендерный запрос)' : 'Альтернативное коммерческое предложение'}
                  </div>
                  <p className="text-black/80 mt-0.5 leading-relaxed">
                    Данный документ сформирован в качестве альтернативного варианта комплектации по запросу контрагента.
                  </p>
                </div>
              </div>
            )}

            {/* Official or Impersonal Header */}
            {isNeutral ? (
              <div className="border-b-2 border-black pb-3 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-black uppercase tracking-wider">
                    КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
                  </div>
                  <div className="text-xs text-black/75 mt-0.5">
                    Спецификация высокоточного оборудования и метрологических услуг
                  </div>
                </div>
                <div className="sm:text-right shrink-0 text-xs text-black">
                  <div className="font-bold text-black">{proposal.toCompany}</div>
                  {proposal.contactPerson && <div>{proposal.contactPerson}</div>}
                </div>
              </div>
            ) : (
              <div className="border-b-2 border-[#003399] pb-3 mb-3 flex items-center justify-between">
                <div className="shrink-0 mr-4">
                  <img
                    src={EMBLEM_DATA_URL}
                    alt="ДС-Инжиниринг"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold tracking-tight text-[#003399] uppercase font-sans">
                    ООО «ДС-Инжиниринг»
                  </div>
                  <div className="text-[10px] text-black mt-0.5 leading-snug">
                    Адрес: 443051, г. Самара, ул. Свободы, 198
                  </div>
                  <div className="text-[10px] text-black leading-snug">
                    тел/факс в Самаре (846) 954-02-92 &nbsp;&nbsp; e-mail: info@ds-enginering.ru
                  </div>
                  <div className="text-[10px] text-black leading-snug">
                    ИНН 6312025587 / КПП 631201001 &nbsp;&nbsp; ОГРН 102 630 077 7986
                  </div>
                </div>
              </div>
            )}

            {/* Registration line: Outgoing & Incoming response + Recipient below letterhead */}
            <div className="flex items-start justify-between text-xs text-black pt-1 pb-1 mb-2">
              <div className="leading-tight font-bold">
                {isNeutral ? (
                  <div>Дата составления: {proposal.date} г.</div>
                ) : (
                  <>
                    <div>Исх. № {(proposal.outgoingNumber || 'ДС-ТКП-2026/09-835').replace(/^(исх\.?\s*№?\s*)+/gi, '')}</div>
                    <div className="pt-0.5">от {proposal.date} г.</div>
                  </>
                )}
                {(proposal.hasIncomingRef || proposal.incomingNumber) && (
                  <div className="font-normal text-black text-[11px] mt-1">
                    {isNeutral ? 'В ответ на запрос' : 'На №'} {(proposal.incomingNumber || '—').replace(/^(на\s*№?\s*)+/gi, '')} {proposal.incomingDate ? `от ${proposal.incomingDate} г.` : ''}
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-black max-w-sm leading-snug">
                <div className="font-bold">{proposal.toCompany}</div>
                {proposal.contactPerson && <div className="font-normal">{proposal.contactPerson}</div>}
              </div>
            </div>

            {/* Title & Greeting */}
            <div className="text-center space-y-1 mb-3 pt-1">
              <div className="text-sm font-bold text-black uppercase tracking-wider">
                {proposal.isAlternative ? 'АЛЬТЕРНАТИВНОЕ КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ' : 'ТЕХНИЧЕСКО-КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ'}
              </div>
              <div className="text-xs font-bold text-black pt-1">
                {effectiveGreeting}
              </div>
              <div className="text-xs text-black">
                Добрый день, в ответ на ваш запрос направляем технико-коммерческое предложение.
              </div>
            </div>

            {/* Unified Specification Table */}
            <div className="mb-4 space-y-1">
              <div className="text-center text-xs font-bold text-black tracking-wider uppercase pb-0.5">
                СПЕЦИФИКАЦИЯ ПОСТАВКИ
              </div>
              <table className="w-full text-left text-[11px] border-collapse border border-black">
                <thead>
                  <tr className="bg-slate-50 text-black font-bold border-b border-black">
                    <th className="p-1.5 border border-black w-10 text-center">№ п/п</th>
                    <th className="p-1.5 border border-black">Наименование</th>
                    <th className="p-1.5 border border-black w-12 text-center">Ед.</th>
                    <th className="p-1.5 border border-black w-14 text-center">Кол-во</th>
                    <th className="p-1.5 border border-black w-28 text-right">Цена за ед.</th>
                    <th className="p-1.5 border border-black w-32 text-right">Стоимость ({curSym})</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items && proposal.items.length > 0 ? (
                    proposal.items.map((item, idx) => (
                      <tr key={item.id || idx} className="text-black">
                        <td className="p-1.5 border border-black text-center font-mono">{idx + 1}</td>
                        <td className="p-1.5 border border-black font-semibold text-black">{item.name}</td>
                        <td className="p-1.5 border border-black text-center">{item.unit || 'шт.'}</td>
                        <td className="p-1.5 border border-black text-center font-mono">{item.quantity}</td>
                        <td className="p-1.5 border border-black text-right font-mono">{item.price ? item.price.toLocaleString('ru-RU') : '—'}</td>
                        <td className="p-1.5 border border-black text-right font-mono font-bold">{((item.price || 0) * (item.quantity || 1)).toLocaleString('ru-RU')} {curSym}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-black">
                      <td className="p-1.5 border border-black text-center font-mono">1</td>
                      <td className="p-1.5 border border-black font-semibold text-black">
                        {proposal.content || 'Комплект высокоточного измерительного оборудования и метрологических услуг'}
                      </td>
                      <td className="p-1.5 border border-black text-center">компл.</td>
                      <td className="p-1.5 border border-black text-center font-mono">1</td>
                      <td className="p-1.5 border border-black text-right font-mono">{totalWithoutVat.toLocaleString('ru-RU')}</td>
                      <td className="p-1.5 border border-black text-right font-mono font-bold">{totalWithoutVat.toLocaleString('ru-RU')} {curSym}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="text-black font-bold">
                    <td colSpan={5} className="p-1.5 border border-black text-right">ИТОГО без НДС, {curSym}:</td>
                    <td className="p-1.5 border border-black text-right font-mono font-bold">{totalWithoutVat.toLocaleString('ru-RU')}</td>
                  </tr>
                  {effectiveVatRate > 0 && vatMode !== 'no_vat' && (
                    <tr className="text-black font-bold">
                      <td colSpan={5} className="p-1.5 border border-black text-right">{vatLineLabel}</td>
                      <td className="p-1.5 border border-black text-right font-mono font-bold">{vatAmount.toLocaleString('ru-RU')}</td>
                    </tr>
                  )}
                  <tr className="text-black font-extrabold text-[12px] bg-slate-50">
                    <td colSpan={5} className="p-1.5 border border-black text-right uppercase">{totalLineLabel}</td>
                    <td className="p-1.5 border border-black text-right font-mono font-bold text-black">{totalWithVat.toLocaleString('ru-RU')} {curSym}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="text-[10px] text-black italic pt-1">
                Сумма прописью: {wordsRu}
              </div>
              {vatNotice && (
                <div className="text-[10px] text-black italic">
                  * {vatNotice}
                </div>
              )}
            </div>

            {/* Document Images if present */}
            {proposal.documentImages && proposal.documentImages.length > 0 && (
              <div className="mb-4 p-3.5 rounded border border-black space-y-3">
                <div className="text-xs font-bold uppercase text-black tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-black" />
                  <span>Иллюстрации и схемы оборудования</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {proposal.documentImages.map((img) => (
                    <div key={img.id} className="text-center p-2 border border-slate-200 rounded bg-slate-50">
                      <img 
                        src={img.url} 
                        alt={img.title || 'Изображение'} 
                        className="max-h-48 mx-auto object-contain rounded"
                      />
                      {img.title && <div className="text-xs font-bold text-black mt-1.5">{img.title}</div>}
                      {img.caption && <div className="text-[10px] text-slate-600 mt-0.5">{img.caption}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Conditions Standard DS Engineering or Neutral Impersonal */}
            <div className="border border-black p-3 rounded space-y-1.5 text-[11px] text-black leading-normal mb-4">
              <div className="font-bold text-black text-xs">Условия поставки и гарантии:</div>
              <div>• <strong>Срок действия коммерческого предложения:</strong> до {proposal.validUntil || '14 календарных дней'} г.</div>
              <div>• <strong>Условия оплаты:</strong> 50% авансовый платеж в течение 5 банковских дней, 50% по факту готовности к отгрузке.</div>
              {isNeutral ? (
                <div>• <strong>Базис поставки:</strong> со склада Поставщика (DDP склад Заказчика).</div>
              ) : null}
              <div>• <strong>Гарантийный срок:</strong> 12–24 месяца с момента ввода оборудования в эксплуатацию.</div>
              <div>• <strong>Метрологическая поверка:</strong> с внесением в Федеральный информационный фонд ФГИС «АРШИН».</div>
            </div>

            {/* Signature & Organization Details with Strictly Centered Seal */}
            <div className="pt-4 border-t border-black relative flex items-end justify-between min-h-[110px] text-xs text-black mb-2">
              {isNeutral ? (
                /* Impersonal: Strictly 2 lines for «Исполнитель» */
                <div className="space-y-1 min-w-[200px] z-10 text-left">
                  <div className="font-bold uppercase tracking-wide">
                    Исполнитель
                  </div>
                  <div className="pt-7 font-medium">
                    ____________________ / {proposal.impersonalSignerName || proposal.executorName || '____________________'}
                  </div>
                </div>
              ) : (
                /* Official: Director of DS-Engineering */
                <div className="space-y-0.5 min-w-[200px] z-10 text-left">
                  <div className="font-bold">Генеральный директор</div>
                  <div className="text-[11px]">ООО «ДС‑Инжиниринг»</div>
                  <div className="pt-5 font-bold">Некрасов С.Ю.</div>
                </div>
              )}

              {/* Strictly Centered Seal & Signature (Never at the edge) */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center justify-center pointer-events-none z-20">
                <div className="relative w-44 h-28 flex items-center justify-center">
                  {isNeutral ? (
                    <div className="w-24 h-24 rounded-full border-2 border-blue-600/80 flex items-center justify-center text-[8.5px] text-blue-800 text-center font-serif leading-tight opacity-80 transform -rotate-6 bg-white/30 backdrop-blur-[0.5px]">
                      ОТДЕЛ СБЫТА И ПРОДАЖ<br />
                      <span className="text-xs font-bold my-0.5 inline-block">М. П.</span><br />
                      ДЛЯ ДОКУМЕНТОВ
                    </div>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 240 100"
                        className="absolute w-36 h-20 z-10 opacity-95 transform -rotate-3 pointer-events-none"
                        fill="none"
                      >
                        <path d="M 15 65 Q 25 15, 38 45 T 52 50 Q 60 20, 68 52 Q 74 62, 85 48 Q 95 38, 105 52 T 120 48 Q 132 30, 142 55 Q 150 75, 175 42 Q 195 20, 225 35" 
                              stroke="#1e40af" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
                        <path d="M 32 40 C 45 42, 60 38, 80 44 M 65 42 Q 78 72, 86 62 Q 95 50, 110 56" 
                              stroke="#1e3a8a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
                        <path d="M 125 50 Q 155 78, 190 70 Q 220 62, 232 40" 
                              stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                        <path d="M 40 78 Q 90 85, 160 80 Q 210 75, 230 60" 
                              stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
                        <circle cx="168" cy="38" r="2.2" fill="#1e40af" />
                        <circle cx="198" cy="32" r="2.2" fill="#1e40af" />
                      </svg>
                      <div className="w-24 h-24 rounded-full border-2 border-blue-600/80 flex items-center justify-center text-[9px] text-blue-800 text-center font-serif leading-tight opacity-75 transform -rotate-12 bg-white/20 backdrop-blur-[0.5px]">
                        ООО «ДС-ИНЖИНИРИНГ»<br />М.П.<br />ОГРН 1126312004520
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="min-w-[200px] pointer-events-none"></div>
            </div>

            {/* Executor Footer Block: strictly 3 vertical lines, no horizontal divider line */}
            {!isNeutral && (
              <div className="pt-2 text-left text-[10px] text-black leading-tight space-y-0.5">
                <div className="font-semibold">Исполнитель:</div>
                <div>{staff.position || 'Инженер по внедрению CAD/CAM и постпроцессорам'} — {proposal.executorName || proposal.preparedBy || 'Скобелев А.С.'}</div>
                <div>Тел: {staff.phone || '+7 (937) 984-61-51'}&nbsp;&nbsp;E-mail: {staff.email || 'a.skobelev@ds-enginering.ru'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Modal Footer / Info Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 shrink-0">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500">{staff.position}:</span>
              <strong className="text-gray-900 font-bold">{proposal.preparedBy}</strong>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-500">Файлов:</span>
              <span className="font-semibold text-gray-800">
                {proposal.versions && proposal.versions.length > 0 ? proposal.versions.length : '1 (Бланк)'}
              </span>
            </div>
            {proposal.dealId && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Сделка:</span>
                  <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {proposal.dealId}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="text-[11px] text-gray-400 italic">
            Официальный документ • ООО «ДС‑Инжиниринг»
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal inside Viewer */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-sm space-y-4 border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Удалить коммерческое предложение?</h3>
              <p className="text-xs text-gray-500">
                КП <strong className="text-gray-800">{proposal.outgoingNumber}</strong> для компании <strong className="text-gray-800">{proposal.toCompany}</strong> будет безвозвратно удалено из реестра.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onClose();
                  onDelete?.(proposal.id);
                }}
                className="px-5 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Да, удалить КП</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRM Interactive Documentation Modal */}
      <CrmDocumentationModal
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
        initialTab="proposals"
      />
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
