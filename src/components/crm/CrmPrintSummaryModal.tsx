import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Building2, 
  TrendingUp, 
  Calendar,
  Layers,
  Award,
  Factory
} from 'lucide-react';

interface CrmPrintSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  totalPipelineRub: number;
  activeDealsCount: number;
  totalMachinesCount: number;
  totalPlantsCount: number;
  recentRequests: Array<{
    id: string;
    customerName: string;
    companyName: string;
    phone: string;
    email: string;
    topic: string;
    estimatedPrice: number;
    manager: string;
    createdAt: string;
  }>;
}

export const CrmPrintSummaryModal: React.FC<CrmPrintSummaryModalProps> = ({
  isOpen,
  onClose,
  periodLabel,
  totalPipelineRub,
  activeDealsCount,
  totalMachinesCount,
  totalPlantsCount,
  recentRequests
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (printWindow) {
      const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Сводный_отчет_CRM_ДС_Инжиниринг</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: "Segoe UI", Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 20px; font-weight: 800; color: #0284c7; margin: 0; }
    .subtitle { font-size: 11px; color: #64748b; margin-top: 3px; }
    .meta { text-align: right; font-size: 11px; color: #475569; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background: #f8fafc; }
    .stat-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .stat-value { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 15px; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; font-weight: 700; color: #334155; }
    td { border: 1px solid #e2e8f0; padding: 6px 8px; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">ООО «ДС-ИНЖИНИРИНГ»</h1>
      <div class="subtitle">Сводный оперативный отчет CRM по входящим запросам и воронке (${periodLabel})</div>
    </div>
    <div class="meta">
      <div>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div>
      <div>Статус: Официальный документ</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-title">Объем портфеля</div>
      <div class="stat-value">${(totalPipelineRub / 1_000_000).toFixed(1)} млн ₽</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Активных сделок</div>
      <div class="stat-value">${activeDealsCount} контрактов</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">КИМ в парке</div>
      <div class="stat-value">${totalMachinesCount}+ единиц</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Оснащенных заводов</div>
      <div class="stat-value">${totalPlantsCount}+ предприятий</div>
    </div>
  </div>

  <h3 style="font-size: 13px; margin: 15px 0 6px 0; color: #0f172a;">Реестр оперативных запросов и спецификаций</h3>
  <table>
    <thead>
      <tr>
        <th>№</th>
        <th>Заказчик / Предприятие</th>
        <th>Тематика / Оборудование</th>
        <th>Сумма (₽)</th>
        <th>Менеджер</th>
        <th>Дата</th>
      </tr>
    </thead>
    <tbody>
      ${recentRequests.map(r => `
        <tr>
          <td>${r.id}</td>
          <td><strong>${r.companyName}</strong><br><span style="color:#64748b">${r.customerName}</span></td>
          <td>${r.topic}</td>
          <td style="font-family: monospace; font-weight: bold;">${r.estimatedPrice.toLocaleString('ru-RU')} ₽</td>
          <td>${r.manager}</td>
          <td>${r.createdAt}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>ООО «ДС-Инжиниринг», 443051, г. Самара, ул. Свободы, 198 • 8 (846) 954-02-92</div>
    <div>Корпоративная CRM-платформа v2.9</div>
  </div>
</body>
</html>`;
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 350);
    } else {
      window.print();
    }
  };

  const handleCopySummary = () => {
    const summaryText = `СВОДНЫЙ ОТЧЕТ CRM «ДС-ИНЖИНИРИНГ» (${periodLabel})
Дата: ${new Date().toLocaleDateString('ru-RU')}
Объем воронки: ${(totalPipelineRub / 1_000_000).toFixed(1)} млн ₽
Активных сделок: ${activeDealsCount}
Оснащенных заводов: ${totalPlantsCount}+
Запросов в реестре: ${recentRequests.length}

Ключевые запросы:
${recentRequests.slice(0, 5).map(r => `- ${r.companyName} (${r.topic}): ${r.estimatedPrice.toLocaleString('ru-RU')} ₽, отв.: ${r.manager}`).join('\n')}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['ID Запроса', 'Заказчик', 'Предприятие', 'Телефон', 'Email', 'Тематика', 'Сумма (₽)', 'Менеджер', 'Дата'];
    const rows = recentRequests.map(r => [
      r.id,
      `"${r.customerName}"`,
      `"${r.companyName}"`,
      r.phone,
      r.email,
      `"${r.topic}"`,
      r.estimatedPrice,
      r.manager,
      r.createdAt
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DS_Engineering_CRM_Summary_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-sm flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Печать и выгрузка сводки CRM
              </h3>
              <p className="text-xs text-slate-500">
                Официальный отчет за период: <span className="font-semibold text-blue-600">{periodLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Распечатать</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Экспорт CSV</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Скопировано' : 'Копировать'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body / Report Sheet */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-lg p-8 shadow-sm space-y-6">
            
            {/* Title */}
            <div className="border-b border-blue-600 pb-4 flex justify-between items-end">
              <div>
                <div className="text-xl font-black text-blue-700 tracking-wide">
                  ООО «ДС-ИНЖИНИРИНГ»
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Инженерно-метрологический центр • Самара
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>Дата: <strong>{new Date().toLocaleDateString('ru-RU')}</strong></div>
                <div>Период: <strong>{periodLabel}</strong></div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Объем воронки</div>
                <div className="text-lg font-black text-blue-700 font-mono mt-1">
                  {(totalPipelineRub / 1_000_000).toFixed(1)}M ₽
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Активных сделок</div>
                <div className="text-lg font-black text-emerald-600 font-mono mt-1">
                  {activeDealsCount}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-500 uppercase">КИМ в парке</div>
                <div className="text-lg font-black text-amber-600 font-mono mt-1">
                  {totalMachinesCount}+
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Заводов в базе</div>
                <div className="text-lg font-black text-slate-800 font-mono mt-1">
                  {totalPlantsCount}+
                </div>
              </div>
            </div>

            {/* Recent RFQs Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Текущие запросы и спецификации ({recentRequests.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full data-dense-table text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="p-2.5">Заказчик / Предприятие</th>
                      <th className="p-2.5">Тематика</th>
                      <th className="p-2.5 text-right">Сумма</th>
                      <th className="p-2.5">Менеджер</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">
                          {r.companyName}
                          <div className="font-normal text-[11px] text-slate-500">{r.customerName}</div>
                        </td>
                        <td className="p-2.5 text-slate-700">{r.topic}</td>
                        <td className="p-2.5 font-mono font-bold text-right text-blue-700 whitespace-nowrap">
                          {r.estimatedPrice.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="p-2.5 text-slate-500 text-[11px]">{r.manager}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
