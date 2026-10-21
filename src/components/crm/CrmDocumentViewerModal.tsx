import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck, 
  Building2, 
  Calendar, 
  User, 
  Trash2, 
  FileSpreadsheet, 
  Award,
  Stamp,
  Lock,
  Coins
} from 'lucide-react';
import { ProjectDocument, ExtendedDeal } from '../../data/mockCrmData';
import { DsLogo } from '../common/DsLogo';
import { CurrencyCode, getCurrencySymbol, getCurrencyName } from '../../types';
import { handleUnifiedA4ExportAction } from '../../utils/a4DocumentExportHandler';

interface CrmDocumentViewerModalProps {
  document: ProjectDocument;
  deal: ExtendedDeal;
  onClose: () => void;
  onDeleteDocument?: (docId: string) => void;
  canDelete?: boolean;
}

export const CrmDocumentViewerModal: React.FC<CrmDocumentViewerModalProps> = ({
  document: doc,
  deal,
  onClose,
  onDeleteDocument,
  canDelete = true,
}) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const [docCurrency, setDocCurrency] = useState<CurrencyCode>(deal.currency || 'RUB');

  // Compute 3-point VAT values (prices in specification are without VAT)
  const totalWithoutVat = (deal.items && deal.items.length > 0)
    ? deal.items.reduce((acc, it) => acc + (it.quantity * it.price), 0)
    : Math.round(deal.estimatedPrice / 1.22);
  const vat22 = Math.round(totalWithoutVat * 0.22);
  const totalWithVat22 = totalWithoutVat + vat22;
  const curSym = getCurrencySymbol(docCurrency);

  const handlePrint = async () => {
    try {
      await handleUnifiedA4ExportAction('print', {
        container: printableRef.current || document.body
      });
    } catch (e) {
      console.error('Unified print error:', e);
      window.focus();
      window.print();
    }
  };

  const handleDownloadStub = async () => {
    if (doc.fileDataUrl) {
      const link = window.document.createElement('a');
      link.href = doc.fileDataUrl;
      link.download = doc.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      return;
    }

    if (printableRef.current) {
      try {
        const safeName = (doc.name || 'Документ').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
        await handleUnifiedA4ExportAction('pdf', {
          container: printableRef.current,
          filename: `${safeName}.pdf`
        });
        return;
      } catch (err) {
        console.error('PDF export error in modal:', err);
      }
    }

    // Fallback: Generate downloadable formatted HTML/Text file
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
    .stamp-box { margin-top: 40px; border: 2px dashed #3b82f6; padding: 15px; width: 280px; text-align: center; color: #1d4ed8; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header" style="display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px;">
    <img src="${window.location.origin}/logo.svg" width="50" height="50" alt="ДС‑Инжиниринг" style="vertical-align: middle; object-fit: contain;" />
    <div>
      <div class="title">ООО «ДС‑Инжиниринг» — Официальный документ</div>
      <div class="meta">г. Самара, ул. Свободы, д. 198 | ИНН 6312025587 / КПП 631201001 | Тел: +7 (846) 954-02-92 | info@ds-enginering.ru</div>
    </div>
  </div>
  <h2>${doc.name}</h2>
  <p><strong>Заказчик / Контрагент:</strong> ${deal.companyName} (ИНН: ${deal.inn || '6312002341'})</p>
  <p><strong>Контактное лицо:</strong> ${deal.customerName}</p>
  <p><strong>Сделка:</strong> № ${deal.id} (${deal.serviceType})</p>
  <p><strong>Дата создания:</strong> ${doc.date}</p>
  <hr />
  <div style="margin: 20px 0;">
    ${printableRef.current?.innerHTML || 'Документ согласован сторонами.'}
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

  const getDocTypeBadge = () => {
    switch (doc.type) {
      case 'proposal':
        return { label: 'Технико-коммерческое предложение (ТКП)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'nda':
        return { label: 'Соглашение о конфиденциальности (NDA)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'contract':
        return { label: 'Договор поставки / услуг', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'spec':
        return { label: 'Акт аудита / Спецификация', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'certificate':
        return { label: 'Свидетельство о поверке', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'drawing':
        return { label: 'Контрольный чертеж / CAD', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { label: 'Проектный документ', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const badge = getDocTypeBadge();

  const modalContent = (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-lg max-w-4xl w-full shadow-sm border border-gray-200 flex flex-col mt-4 sm:mt-10 mb-10 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gray-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 shrink-0 relative">
          {/* Top Row: Info & Pinned Mobile Close */}
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {doc.size} • {doc.date}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {doc.name}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="sm:hidden p-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer shrink-0 ml-1"
              title="Закрыть окно"
              aria-label="Закрыть окно"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar pb-1 sm:pb-0 pt-2 sm:pt-0 border-t border-gray-800 sm:border-t-0 w-full sm:w-auto">
            {/* Currency selector for commercial/contract/spec documents */}
            <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700 text-xs shrink-0">
              <Coins className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-gray-400 text-[10px] uppercase font-bold hidden sm:inline">Валюта:</span>
              <select
                value={docCurrency}
                onChange={(e) => setDocCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-white font-bold cursor-pointer outline-none text-xs"
                title="Выбор валюты документа"
              >
                <option value="RUB" className="bg-gray-800 text-white">Рубли (₽)</option>
                <option value="USD" className="bg-gray-800 text-white">Доллар США ($)</option>
                <option value="EUR" className="bg-gray-800 text-white">Евро (€)</option>
                <option value="CNY" className="bg-gray-800 text-white">Юани (¥)</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors cursor-pointer shrink-0"
              title="Распечатать / Экспорт в PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadStub}
              className="p-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors cursor-pointer shrink-0"
              title="Скачать файл"
            >
              <Download className="w-4 h-4" />
            </button>
            {onDeleteDocument && canDelete && (
              <button
                onClick={() => {
                  if (window.confirm(`Удалить документ «${doc.name}» из проекта?`)) {
                    onDeleteDocument(doc.id);
                    onClose();
                  }
                }}
                className="p-2 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-800/50 transition-colors cursor-pointer shrink-0"
                title="Удалить документ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="hidden sm:flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer ml-1 shrink-0"
              title="Закрыть окно"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-gray-100/70 flex-1">
          {/* If user uploaded real base64 image file */}
          {doc.fileDataUrl && doc.fileDataUrl.startsWith('data:image/') ? (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
              <img 
                src={doc.fileDataUrl} 
                alt={doc.name} 
                className="max-h-[65vh] mx-auto rounded-lg object-contain shadow-xs" 
              />
            </div>
          ) : (
            /* Structured Authentic Document Paper Canvas */
            <div 
              ref={printableRef}
              className="a4-page-render bg-white rounded-lg shadow-lg border border-gray-300 p-6 sm:p-10 max-w-3xl mx-auto text-gray-900 font-sans space-y-6"
            >
              {/* Letterhead Header */}
              <div className="border-b-2 border-blue-600 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <DsLogo size={48} />
                  <div>
                    <div className="text-xl font-black text-blue-900 tracking-tight flex items-center gap-2">
                      <span>ООО «ДС‑ИНЖИНИРИНГ»</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-md leading-relaxed">
                      Комплексные метрологические решения, поставка КИМ, 3D-сканеров и внедрение CAD/CAM TopSolid 7
                    </p>
                  </div>
                </div>
                <div className="text-right sm:text-right text-[11px] text-slate-500 space-y-0.5 border-l-2 sm:border-l-0 pl-3 sm:pl-0 border-gray-200">
                  <div><strong>ИНН / КПП:</strong> 6312025587 / 631201001</div>
                  <div><strong>Адрес:</strong> 443051, г. Самара, ул. Свободы, д. 198</div>
                  <div><strong>Тел:</strong> +7 (846) 954-02-92 | info@ds-enginering.ru</div>
                </div>
              </div>

              {/* Document Meta Information */}
              <div className="bg-blue-50/60 rounded-lg p-4 border border-blue-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Заказчик (Контрагент):</span>
                  <div className="font-bold text-gray-900 text-sm mt-0.5">{deal.companyName}</div>
                  <div className="text-[11px] text-slate-500">ИНН: {deal.inn || '6312002341'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Контактное лицо / ЛПР:</span>
                  <div className="font-bold text-gray-900 mt-0.5">{deal.customerName}</div>
                  <div className="text-[11px] text-slate-500">{deal.phone} • {deal.email}</div>
                </div>
                <div>
                  <span className="text-gray-500">Номер сделки в CRM:</span>
                  <div className="font-bold text-blue-800">{deal.id}</div>
                </div>
                <div>
                  <span className="text-gray-500">Дата документа:</span>
                  <div className="font-semibold text-gray-800">{doc.date}</div>
                </div>
              </div>

              {/* Dynamic Content by Document Type */}
              {doc.type === 'proposal' && (
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <h1 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-wide">
                      ТЕХНИКО-КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Предмет: {deal.serviceType}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Уважаемый(ая) <strong>{deal.customerName}</strong>! В ответ на Ваше техническое задание инжиниринговая компания 
                    «ДС‑Инжиниринг» направляет официальное коммерческое предложение на поставку и пусконаладку оборудования:
                  </p>

                  {/* Items Spec Table */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-xs">
                    <table className="w-full data-dense-table text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-slate-500 font-bold border-b border-gray-200">
                          <th className="p-2.5">№</th>
                          <th className="p-2.5">Наименование оборудования / услуг</th>
                          <th className="p-2.5 text-center">Кол-во</th>
                          <th className="p-2.5 text-right">Сумма без НДС ({curSym})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {deal.items && deal.items.length > 0 ? (
                          deal.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-2.5 text-gray-500 font-mono">{idx + 1}</td>
                              <td className="p-2.5 font-medium text-gray-900">{item.name}</td>
                              <td className="p-2.5 text-center text-slate-500">{item.quantity} шт.</td>
                              <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                                {(item.price * item.quantity).toLocaleString('ru-RU')} {curSym}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="p-2.5 text-gray-500 font-mono">1</td>
                            <td className="p-2.5 font-medium text-gray-900">{deal.serviceType}</td>
                            <td className="p-2.5 text-center text-slate-500">1 компл.</td>
                            <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                              {totalWithoutVat.toLocaleString('ru-RU')} {curSym}
                            </td>
                          </tr>
                        )}
                        {/* 3-point VAT Summary */}
                        <tr className="bg-gray-50/90 border-t-2 border-gray-300 font-bold text-gray-800">
                          <td colSpan={3} className="p-2.5 text-right">ИТОГО без НДС:</td>
                          <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                            {totalWithoutVat.toLocaleString('ru-RU')} {curSym}
                          </td>
                        </tr>
                        <tr className="bg-gray-50/90 text-slate-500 font-semibold border-t border-gray-200">
                          <td colSpan={3} className="p-2.5 text-right">В том числе НДС 22%:</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-blue-700">
                            {vat22.toLocaleString('ru-RU')} {curSym}
                          </td>
                        </tr>
                        <tr className="bg-blue-50/80 font-black text-blue-950 border-t-2 border-blue-300">
                          <td colSpan={3} className="p-3 text-right text-xs">ИТОГО с учетом НДС 22%:</td>
                          <td className="p-3 text-right text-sm font-black text-blue-900 font-mono">
                            {totalWithVat22.toLocaleString('ru-RU')} {curSym}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-gray-200 text-xs space-y-1 text-slate-500">
                    <div><strong>Условия оплаты:</strong> 50% авансовый платеж, 50% по факту приемки оборудования на территории Заказчика.</div>
                    <div><strong>Срок поставки:</strong> 25-45 календарных дней со склада в Самаре / Шанхае.</div>
                    <div><strong>Гарантийные обязательства:</strong> 24 месяца официальной гарантии с выездом сертифицированных инженеров.</div>
                  </div>
                </div>
              )}

              {doc.type === 'nda' && (
                <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
                  <div className="text-center py-2">
                    <h1 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-wide">
                      СОГЛАШЕНИЕ О НЕРАЗГЛАШЕНИИ КОНФИДЕНЦИАЛЬНОЙ ИНФОРМАЦИИ (NDA)
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                      г. Самара — {doc.date}
                    </p>
                  </div>

                  <p>
                    <strong>ООО «ДС‑Инжиниринг»</strong>, именуемое в дальнейшем «Исполнитель», в лице Генерального директора, 
                    с одной стороны, и <strong>{deal.companyName}</strong>, именуемое в дальнейшем «Заказчик», в лице {deal.customerName}, 
                    заключили настоящее Соглашение о нижеследующем:
                  </p>

                  <div className="space-y-2 border-l-2 border-emerald-500 pl-4 py-1 text-gray-800">
                    <p>
                      <strong>1. Предмет соглашения:</strong> Стороны договорились обеспечить полную конфиденциальность в отношении 
                      инженерных чертежей, математических CAD/CAM моделей (форматы {deal.cadFormat || 'STEP/IGES'}), схем оснастки, 
                      метрологических допусков и технологических карт деталей Заказчика.
                    </p>
                    <p>
                      <strong>2. Обязательства:</strong> Исполнитель обязуется не передавать третьим лицам и использовать полученные 
                      данные исключительно для проведения тестовых замеров, реверс-инжиниринга и настройки измерительного ПО.
                    </p>
                    <p>
                      <strong>3. Срок действия:</strong> Настоящее Соглашение действует в течение 5 (пяти) лет с момента подписания.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Документ зарегистрирован в реестре и имеет юридическую силу.</span>
                  </div>
                </div>
              )}

              {doc.type === 'contract' && (
                <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
                  <div className="text-center py-2">
                    <h1 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-wide">
                      ДОГОВОР ПОСТАВКИ И ПУСКОНАЛАДКИ № ДС-{deal.id.slice(-7)}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                      на поставку метрологического оборудования и внедрение САПР
                    </p>
                  </div>

                  <p>
                    По настоящему договору Поставщик обязуется передать в собственность Покупателя (<strong>{deal.companyName}</strong>), 
                    а Покупатель принять и оплатить высокоточное оборудование: <strong>{deal.serviceType}</strong> в соответствии со 
                    Спецификацией на общую сумму <strong>{totalWithVat22.toLocaleString('ru-RU')} {curSym} с учетом НДС 22%</strong> (в том числе НДС 22%: <strong>{vat22.toLocaleString('ru-RU')} {curSym}</strong>; сумма без НДС: <strong>{totalWithoutVat.toLocaleString('ru-RU')} {curSym}</strong>).
                  </p>

                  <div className="bg-amber-50/80 p-3.5 rounded-lg border border-amber-200 text-amber-950 space-y-1">
                    <div><strong>Раздел 4. Приемка и шеф-монтаж:</strong> Поставка включает выезд сертифицированного инженера «ДС‑Инжиниринг», проведение калибровки по эталонам 1-го разряда и оформление протокола первичной поверки.</div>
                  </div>
                </div>
              )}

              {(doc.type === 'spec' || doc.type === 'drawing' || doc.type === 'certificate') && (
                <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
                  <div className="text-center py-2">
                    <h1 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-wide">
                      АКТ МЕТРОЛОГИЧЕСКОГО АУДИТА И СПЕЦИФИКАЦИЯ ТРЕБОВАНИЙ
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Инженерный отдел координатно-измерительных систем «ДС‑Инжиниринг»
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-gray-200 space-y-2">
                    <div><strong>Объект измерений:</strong> {deal.details || 'Контроль геометрии и шероховатости партии прецизионных деталей'}</div>
                    <div><strong>Применяемое эталонное оборудование:</strong> {deal.clientEquipment?.model || 'КИМ Mitutoyo CRYSTA-Apex S'} (Зав. № {deal.clientEquipment?.serialNumber || 'MIT-88412'})</div>
                    <div><strong>Предельная допустимая погрешность:</strong> MPEE = (1.7 + 3L/1000) мкм</div>
                    <div><strong>Стандарты соответствия:</strong> ГОСТ Р ИСО 10360-2, ГОСТ 8.568-2017</div>
                  </div>

                  {/* Specification Table in Spec Document */}
                  {deal.items && deal.items.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-xs mt-3">
                      <div className="bg-gray-100 p-2 text-[11px] font-bold text-slate-500 border-b border-gray-200">
                        Спецификация поставляемого оборудования и услуг
                      </div>
                      <table className="w-full data-dense-table text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-slate-500 font-bold border-b border-gray-200">
                            <th className="p-2">№</th>
                            <th className="p-2">Наименование</th>
                            <th className="p-2 text-center">Кол-во</th>
                            <th className="p-2 text-right">Сумма без НДС ({curSym})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {deal.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="p-2 text-gray-500 font-mono">{idx + 1}</td>
                              <td className="p-2 font-medium text-gray-900">{item.name}</td>
                              <td className="p-2 text-center text-slate-500">{item.quantity} шт.</td>
                              <td className="p-2 text-right font-mono font-bold text-gray-900">
                                {(item.price * item.quantity).toLocaleString('ru-RU')} {curSym}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50/90 border-t-2 border-gray-300 font-bold text-gray-800">
                            <td colSpan={3} className="p-2 text-right">ИТОГО без НДС:</td>
                            <td className="p-2 text-right font-mono font-bold text-gray-900">
                              {totalWithoutVat.toLocaleString('ru-RU')} {curSym}
                            </td>
                          </tr>
                          <tr className="bg-gray-50/90 text-slate-500 font-semibold border-t border-gray-200">
                            <td colSpan={3} className="p-2 text-right">В том числе НДС 22%:</td>
                            <td className="p-2 text-right font-mono font-semibold text-blue-700">
                              {vat22.toLocaleString('ru-RU')} {curSym}
                            </td>
                          </tr>
                          <tr className="bg-blue-50/80 font-black text-blue-950 border-t-2 border-blue-300">
                            <td colSpan={3} className="p-2.5 text-right text-xs">ИТОГО с учетом НДС 22%:</td>
                            <td className="p-2.5 text-right text-sm font-black text-blue-900 font-mono">
                              {totalWithVat22.toLocaleString('ru-RU')} {curSym}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <p>
                    Результаты первичного сканирования и анализа чертежей подтверждают возможность обеспечения заданной точности 
                    обработки на технологическом оборудовании Заказчика.
                  </p>
                </div>
              )}

              {/* Signatures & Seal Stamp Footer */}
              <div className="pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div>
                  <div className="text-xs font-bold text-gray-900 mb-2">ПОСТАВЩИК / ИСПОЛНИТЕЛЬ:</div>
                  <div className="text-[11px] text-slate-500">ООО «ДС‑Инжиниринг»</div>
                  <div className="text-[11px] text-gray-500">Генеральный директор: Некрасов С.Ю.</div>
                  
                  {/* Official Blue Seal Stamp Graphic */}
                  <div className="mt-3 inline-flex items-center gap-3 p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-dashed flex items-center justify-center text-[8px] font-black text-center text-blue-700 leading-tight">
                      ПЕЧАТЬ<br />ДС-ИНЖ
                    </div>
                    <div className="text-[10px] space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <FileCheck className="w-3 h-3 text-blue-600" />
                        <span>ДОКУМЕНТ УТВЕРЖДЕН</span>
                      </div>
                      <div className="text-gray-500 font-mono text-[9px]">РЕГ. №: DS-DOC-{doc.id}</div>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-xs font-bold text-gray-900 mb-2">ЗАКАЗЧИК:</div>
                  <div className="text-[11px] text-slate-500">{deal.companyName}</div>
                  <div className="text-[11px] text-gray-500">{deal.customerName}</div>
                  <div className="mt-4 text-[10px] text-gray-400 italic">
                    Электронный экземпляр зарегистрирован в CRM-системе
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Файл проверен антивирусным шлюзом «ДС‑Инжиниринг»</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadStub}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать документ</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
