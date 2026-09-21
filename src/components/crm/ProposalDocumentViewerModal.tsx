import React, { useRef, useState } from 'react';
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
  Coins
} from 'lucide-react';
import { CommercialProposal, ProposalVersion, CurrencyCode, getCurrencySymbol } from '../../types';
import { DsLogo } from '../common/DsLogo';
import { getStaffMemberInfo } from '../../utils/staffDirectory';

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
  const staff = getStaffMemberInfo(proposal.preparedBy);

  // 3-point VAT calculation
  const curSym = getCurrencySymbol(docCurrency);
  const totalWithoutVat = proposal.amount ? Math.round(proposal.amount / 1.22) : 0;
  const vat22 = proposal.amount ? Math.round(totalWithoutVat * 0.22) : 0;
  const totalWithVat22 = proposal.amount || (totalWithoutVat + vat22);

  // Default to the first version or generate dummy version if none
  const currentVersion: ProposalVersion = version || (proposal.versions && proposal.versions.length > 0 ? proposal.versions[0] : {
    id: 'default_v1',
    version: 1,
    name: `${proposal.outgoingNumber.replace(/\//g, '_')}_ТКП.pdf`,
    size: '1.8 MB',
    uploadedAt: proposal.date,
    uploadedBy: proposal.preparedBy
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
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
    const docHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${proposal.outgoingNumber} - ${proposal.toCompany}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px; }
    .logo { font-size: 22px; font-weight: 800; color: #0369a1; letter-spacing: 0.5px; }
    .sublogo { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
    .doc-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 20px; margin-bottom: 10px; }
    .akp-badge { display: inline-block; background: ${isPartnerAkp ? '#64748b' : '#0284c7'}; color: white; padding: 4px 12px; font-size: 11px; font-weight: bold; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .meta-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 13px; }
    .meta-label { font-weight: bold; background: #f8fafc; color: #475569; width: 28%; }
    .content-box { background: ${isPartnerAkp ? '#f1f5f9' : '#f8fafc'}; border: 1px solid ${isPartnerAkp ? '#cbd5e1' : '#bfdbfe'}; border-radius: 8px; padding: 18px; margin-bottom: 25px; }
    .content-box h4 { margin-top: 0; color: #0369a1; }
    .amount-box { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; color: #047857; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
    .stamp { display: inline-block; border: 2px solid #0284c7; color: #0284c7; padding: 8px 14px; border-radius: 8px; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 11px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px;">
    <div style="display: flex; align-items: center; gap: 16px;">
      <img src="${window.location.origin}/logo.svg" width="56" height="56" alt="ДС‑Инжиниринг" style="vertical-align: middle; object-fit: contain;" />
      <div>
        <div class="logo">ИНЖИНИРИНГОВАЯ КОМПАНИЯ «ДС‑ИНЖИНИРИНГ»</div>
        <div class="sublogo">Поставка прецизионных КИМ • 3D-сканирование • PolyWorks • TopSolid 7 • Сервис и поверка</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
          ИНН 6312025587 / КПП 631201001 • г. Самара, ул. Свободы, д. 198 • Тел: +7 (846) 954-02-92 • info@ds-enginering.ru
        </div>
      </div>
    </div>
  </div>

  ${isAkp ? `<div class="akp-badge">${isPartnerAkp ? 'АКП для партнеров (Тендерный запрос)' : 'АКП (Альтернативная поставка)'}</div>` : ''}

  <div class="doc-title">
    ${isAkp ? (isPartnerAkp ? 'АЛЬТЕРНАТИВНОЕ КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ ДЛЯ ПАРТНЕРОВ' : 'АЛЬТЕРНАТИВНОЕ КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ (ПОСТАВКА)') : 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ'} № ${proposal.outgoingNumber}
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Дата регистрации:</td>
      <td><strong>${proposal.date}</strong></td>
    </tr>
    <tr>
      <td class="meta-label">Заказчик (Контрагент):</td>
      <td><strong>${proposal.toCompany}</strong></td>
    </tr>
    <tr>
      <td class="meta-label">Контактное лицо:</td>
      <td>${proposal.contactPerson || '—'}</td>
    </tr>
    <tr>
      <td class="meta-label">Телефон / E-mail:</td>
      <td>${proposal.contactPhone || '—'}</td>
    </tr>
    <tr>
      <td class="meta-label">Ответственный специалист:</td>
      <td><strong>${proposal.preparedBy}</strong> (${staff.position})</td>
    </tr>
    ${proposal.dealId ? `<tr><td class="meta-label">Связанная сделка CRM:</td><td><strong>${proposal.dealId}</strong> ${proposal.dealTitle ? `— ${proposal.dealTitle}` : ''}</td></tr>` : ''}
  </table>

  <div class="content-box">
    <h4>Предмет и спецификация коммерческого предложения</h4>
    <p style="font-size: 14px; font-weight: 600; color: #1e293b;">${proposal.content}</p>
    ${isAkp ? (isPartnerAkp 
      ? '<p style="font-size: 12px; color: #475569; margin-top: 10px; font-style: italic;">* Данный документ подготовлен для партнера по запросу на участие в тендерных процедурах.</p>'
      : '<p style="font-size: 12px; color: #0369a1; margin-top: 10px; font-style: italic;">* Данное предложение сформировано в качестве альтернативного варианта комплектации или оптимизации бюджета по запросу контрагента.</p>'
    ) : ''}
  </div>

  ${proposal.amount ? `
  <div style="margin-top: 25px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; font-size: 13px;">
    <div style="background: #f1f5f9; padding: 10px 14px; font-weight: 800; color: #1e293b; border-bottom: 1px solid #cbd5e1;">
      РАСЧЕТ СТОИМОСТИ КОММЕРЧЕСКОГО ПРЕДЛОЖЕНИЯ
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">ИТОГО без НДС:</td>
        <td style="padding: 10px 14px; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace; border-bottom: 1px solid #e2e8f0;">
          ${totalWithoutVat.toLocaleString('ru-RU')} ${curSym}
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #cbd5e1;">В том числе НДС 22%:</td>
        <td style="padding: 10px 14px; text-align: right; font-weight: 700; color: #0284c7; font-family: monospace; border-bottom: 1px solid #cbd5e1;">
          ${vat22.toLocaleString('ru-RU')} ${curSym}
        </td>
      </tr>
      <tr style="background: #f0f9ff; font-weight: 800;">
        <td style="padding: 12px 14px; color: #0369a1; font-size: 14px;">ИТОГО с учетом НДС 22%:</td>
        <td style="padding: 12px 14px; text-align: right; color: #0369a1; font-size: 15px; font-family: monospace;">
          ${totalWithVat22.toLocaleString('ru-RU')} ${curSym}
        </td>
      </tr>
    </table>
  </div>
  ` : ''}

  ${proposal.note ? `
  <div style="margin-top: 20px; font-size: 13px; background: #eff6ff; padding: 12px; border-radius: 6px; border-left: 4px solid #3b82f6;">
    <strong>Примечание к оферте:</strong> ${proposal.note}
  </div>
  ` : ''}

  <div class="footer">
    <div>
      <div>${staff.position}: <strong>${proposal.preparedBy}</strong></div>
      <div>ООО «ДС‑Инжиниринг» • ${staff.department}</div>
    </div>
    <div style="text-align: right;">
      <div>Срок действия предложения: 30 календарных дней</div>
      <div>Гарантия на оборудование: 12-24 мес.</div>
      <div>info@ds-enginering.ru • +7 (846) 954-02-92</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${proposal.outgoingNumber.replace(/\//g, '_')}_ДС_Инжиниринг.html`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-sm overflow-hidden border border-gray-100 flex flex-col mt-4 sm:mt-10 mb-10 max-h-[90vh]">
        {/* Top Header */}
        <div className="px-4 py-3 bg-gray-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              proposal.isAlternative 
                ? (proposal.akpPurpose === 'partner_tender' || !proposal.akpPurpose ? 'bg-slate-700 text-slate-200' : 'bg-blue-600/30 text-blue-400')
                : 'bg-blue-600/30 text-blue-400'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  {proposal.outgoingNumber}
                </span>
                {proposal.isAlternative ? (
                  (proposal.akpPurpose === 'partner_tender' || !proposal.akpPurpose) ? (
                    <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 border border-slate-600 text-[10px] font-extrabold uppercase tracking-wider">
                      АКП (Для партнеров / тендер)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-blue-900/80 text-blue-300 border border-blue-700 text-[10px] font-extrabold uppercase tracking-wider">
                      АКП (Альтернативная поставка)
                    </span>
                  )
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 border border-blue-800 text-[10px] font-bold uppercase tracking-wider">
                    Основное КП
                  </span>
                )}
                <span className="text-xs text-gray-400">от {proposal.date}</span>
              </div>
              <p className="text-xs text-gray-300 truncate max-w-xl">
                {proposal.toCompany} • {currentVersion.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Currency selector */}
            <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700 text-xs">
              <Coins className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-gray-400 text-[10px] uppercase font-bold hidden sm:inline">Валюта:</span>
              <select
                value={docCurrency}
                onChange={(e) => setDocCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-white font-bold cursor-pointer outline-none text-xs"
                title="Выбор валюты коммерческого предложения"
              >
                <option value="RUB" className="bg-gray-800 text-white">Рубли (₽)</option>
                <option value="USD" className="bg-gray-800 text-white">Доллар США ($)</option>
                <option value="EUR" className="bg-gray-800 text-white">Евро (€)</option>
                <option value="CNY" className="bg-gray-800 text-white">Юани (¥)</option>
              </select>
            </div>

            {canEdit && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(proposal);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600/40 hover:bg-blue-600 text-blue-100 hover:text-white border border-blue-400/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Редактировать параметры КП"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Редактировать</span>
              </button>
            )}

            {(isAdmin || canEdit) && onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Удалить коммерческое предложение"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Удалить</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              title="Распечатать документ"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="Скачать файл коммерческого предложения"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Скачать</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="Закрыть окно"
            >
              <X className="w-5 h-5" />
            </button>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          <div 
            ref={printableRef}
            className="max-w-3xl mx-auto bg-white rounded-lg p-6 sm:p-10 shadow-sm border border-gray-200 text-gray-800 relative"
          >
            {/* Watermark for AKP */}
            {proposal.isAlternative && (
              (proposal.akpPurpose === 'partner_tender' || !proposal.akpPurpose) ? (
                <div className="mb-6 p-4 rounded-lg bg-slate-100 border border-slate-300 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-100 flex items-center justify-center font-bold text-xs shrink-0">
                    АКП
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900 uppercase tracking-wider">
                      АКП для партнеров (Тендерный запрос)
                    </div>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      Данный документ подготовлен для партнера по запросу на участие в тендерных процедурах.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-lg bg-blue-50/80 border border-blue-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    АКП
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-blue-950 uppercase tracking-wider">
                      Альтернативное коммерческое предложение (Поставка)
                    </div>
                    <p className="text-blue-800 mt-0.5 leading-relaxed">
                      Данный документ подготовлен в качестве альтернативного варианта комплектации или оптимизации бюджета по запросу контрагента.
                    </p>
                  </div>
                </div>
              )
            )}

            {/* Official Header */}
            <div className="border-b-2 border-blue-600 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <DsLogo size={52} />
                <div>
                  <div className="text-xl font-extrabold text-blue-900 tracking-tight">
                    ООО «ДС‑ИНЖИНИРИНГ»
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">
                    Поставка КИМ • 3D-сканирование • Метрология • PolyWorks • TopSolid 7
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 leading-tight">
                    ИНН 6321458900 / КПП 632101001 • Самарская обл., г. Тольятти, Южное шоссе 165, технопарк «Жигулевская долина»
                  </div>
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Документ</div>
                <div className="text-sm font-extrabold text-gray-900">{proposal.outgoingNumber}</div>
                <div className="text-xs text-gray-500">от {proposal.date}</div>
              </div>
            </div>

            {/* Recipient & Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50/80 rounded-lg border border-gray-200/70 text-xs">
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Кому (Заказчик)</div>
                <div className="font-extrabold text-sm text-blue-950">{proposal.toCompany}</div>
                {proposal.contactPerson && (
                  <div className="text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>{proposal.contactPerson}</span>
                  </div>
                )}
                {proposal.contactPhone && (
                  <div className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>{proposal.contactPhone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Параметры оферты</div>
                <div>
                  <span className="text-gray-500">Подготовил:</span>{' '}
                  <span className="font-bold text-gray-800">{proposal.preparedBy}</span>
                </div>
                {proposal.dealId && (
                  <div>
                    <span className="text-gray-500">Связанная сделка:</span>{' '}
                    <span className="font-bold text-blue-700">{proposal.dealId}</span>
                    {proposal.dealTitle && <span className="text-slate-500"> ({proposal.dealTitle})</span>}
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Файл версии:</span>{' '}
                  <span className="font-semibold text-slate-500">{currentVersion.name} ({currentVersion.size})</span>
                </div>
              </div>
            </div>

            {/* Main Proposal Content / Scope */}
            <div className="mb-6 space-y-3">
              <div className="text-xs font-extrabold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Предмет коммерческого предложения</span>
              </div>
              <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-2xs space-y-3">
                <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                  {proposal.content}
                </p>

                {proposal.note && (
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900">
                    <span className="font-bold">Условия поставки и примечание:</span> {proposal.note}
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            {proposal.amount ? (
              <div className="mb-8 rounded-lg border border-gray-300 overflow-hidden shadow-xs">
                <div className="bg-gray-100/90 px-4 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wide border-b border-gray-300 flex items-center justify-between">
                  <span>Расчет стоимости коммерческого предложения</span>
                  <span className="text-[11px] font-mono text-gray-500 font-semibold">Валюта: {docCurrency} ({curSym})</span>
                </div>
                <div className="p-4 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="font-bold text-slate-500">ИТОГО без НДС:</span>
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {totalWithoutVat.toLocaleString('ru-RU')} {curSym}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-200 text-slate-500">
                    <span className="font-semibold text-slate-500">В том числе НДС 22%:</span>
                    <span className="font-mono font-semibold text-blue-700">
                      {vat22.toLocaleString('ru-RU')} {curSym}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 bg-blue-50/70 -mx-4 px-4 pb-2 border-t-2 border-blue-300">
                    <span className="font-black text-blue-950 text-xs sm:text-sm uppercase tracking-wide">
                      ИТОГО с учетом НДС 22%:
                    </span>
                    <span className="text-lg sm:text-xl font-black text-blue-900 font-mono">
                      {totalWithVat22.toLocaleString('ru-RU')} {curSym}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Terms & Conditions Standard DS Engineering */}
            <div className="border-t border-gray-200 pt-5 space-y-2 text-[11px] text-gray-500 leading-normal">
              <div className="font-bold text-slate-500 text-xs">Стандартные условия поставки ООО «ДС‑Инжиниринг»:</div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Условия оплаты: 50% авансовый платеж в течение 5 банковских дней, 50% по факту готовности к отгрузке.</li>
                <li>Срок действия коммерческого предложения: 30 календарных дней с даты регистрации.</li>
                <li>Гарантийный срок: 12–24 месяца с момента ввода оборудования в эксплуатацию.</li>
                <li>Метрологическая поверка: с внесением в Федеральный информационный фонд ФГИС «АРШИН».</li>
              </ul>
            </div>

            {/* Signature & Organization Details */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-gray-900">
                  {staff.position}: {proposal.preparedBy}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
                  ООО «ДС‑Инжиниринг» • {staff.department}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4.5 py-2 rounded-lg border border-gray-200 bg-gray-50 text-slate-500 text-[11px] font-bold tracking-wide text-center">
                  <div>ООО «ДС‑Инжиниринг»</div>
                  <div className="text-[10px] text-gray-500 font-medium">г. Самара</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-semibold text-slate-500">
              {staff.position}: <strong className="text-gray-900">{proposal.preparedBy}</strong>
            </span>
            <span>•</span>
            <span>
              {proposal.versions && proposal.versions.length > 0 
                ? `Файлов: ${proposal.versions.length}` 
                : 'Автоматический бланк'}
            </span>
            {proposal.dealId && (
              <>
                <span>•</span>
                <span className="text-blue-700 font-bold">Сделка: {proposal.dealId}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto">
            {(isAdmin || canEdit) && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Удалить это коммерческое предложение"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить КП</span>
              </button>
            )}

            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(proposal);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                title="Редактировать параметры коммерческого предложения"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Редактировать КП</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-gray-100 hover:bg-gray-200 text-slate-500 border border-gray-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Печать или экспорт в PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Печать</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Скачать автономный HTML / PDF бланк"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Закрыть
            </button>
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
    </div>
  );
};
