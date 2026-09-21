import React, { useState } from 'react';
import { LifeBuoy, FileText, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { RegistryToolbar } from '../common/RegistryToolbar';
import { exportTableToPdf } from '../../utils/exportTablePdf';

export const SupportRegistry: React.FC<{ supportTickets: any[], setEditingTicket: any, setTicketModalOpen: any }> = ({ supportTickets, setEditingTicket, setTicketModalOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list'>('list');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const filtered = supportTickets.filter(t => 
    (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.product || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewTicket = () => {
    setEditingTicket(null);
    setTicketModalOpen(true);
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportTableToPdf({
        title: 'Реестр обращений и заявок технической поддержки',
        subtitle: 'ООО «ДС-Инжиниринг» • Департамент сервисной и консультационной поддержки заказчиков',
        department: 'Служба технической поддержки (Service Desk)',
        filterInfo: searchQuery ? `Поиск: "${searchQuery}"` : 'Все текущие обращения',
        summaryBadges: [
          { label: 'Всего заявок', value: filtered.length, color: 'blue' },
          { label: 'Критических', value: filtered.filter(t => t.priority === 'Критический').length, color: 'red' },
          { label: 'В работе', value: filtered.filter(t => t.status === 'В работе').length, color: 'indigo' },
          { label: 'Решено', value: filtered.filter(t => t.status === 'Решена').length, color: 'green' }
        ],
        headers: ['№', 'Номер заявки', 'Дата', 'Тема обращения', 'Продукт / Оборудование', 'Приоритет', 'Статус'],
        rows: filtered.map((t, idx) => [
          String(idx + 1),
          String(t.id || `TICK-${idx + 101}`),
          String(t.date || '—'),
          { text: t.title, subtext: t.description ? t.description.slice(0, 90) + '...' : undefined },
          String(t.product || 'ПО / КИМ'),
          {
            text: t.priority || 'Обычный',
            badge: true,
            color: t.priority === 'Критический' ? 'rose' : t.priority === 'Высокий' ? 'amber' : 'blue'
          },
          {
            text: t.status || 'Открыта',
            badge: true,
            color: t.status === 'Решена' ? 'emerald' : t.status === 'В работе' ? 'blue' : 'slate'
          }
        ]),
        columnAlignments: ['center', 'center', 'center', 'left', 'left', 'center', 'center'],
        columnWidths: ['5%', '13%', '10%', '35%', '17%', '10%', '10%'],
        orientation: 'landscape',
        filename: `Reestr_Zayavok_Podderzhki_${new Date().toISOString().slice(0, 10)}.pdf`
      });
    } catch (err) {
      console.error('Failed to export support tickets PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Заявки в службу технической поддержки</h2>
            <p className="text-xs text-gray-500 mt-0.5">Консультации по TopSolid, PolyWorks, КИМ и постпроцессорам с прикреплением логов и 3D-моделей</p>
          </div>
        </div>

        <button
          onClick={handleCreateNewTicket}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Новая заявка</span>
        </button>
      </div>

      <RegistryToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalCount={filtered.length}
        searchPlaceholder="Поиск по номеру, теме..."
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
      />

      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => { setEditingTicket(t); setTicketModalOpen(true); }}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-xs hover:border-blue-300 transition-all space-y-3 cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md">{t.id}</span>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    t.priority === 'Критический' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    t.priority === 'Высокий' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {t.priority}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">от {t.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  {t.status === 'Решена' ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle2 className="w-4 h-4" />Решена</span>
                  ) : t.status === 'В работе' ? (
                    <span className="flex items-center gap-1 text-blue-600 font-bold text-xs"><AlertCircle className="w-4 h-4" />В работе</span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500 font-bold text-xs"><AlertCircle className="w-4 h-4" />Открыта</span>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">{t.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{t.description}</p>
              <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-gray-500 border-t border-gray-100">
                <div className="flex items-center gap-1.5"><span className="text-gray-400">ПО / Оборудование:</span><span className="font-semibold text-slate-500">{t.product}</span></div>
                {t.files > 0 && (
                  <div className="flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    <FileText className="w-3 h-3" /> Вложений: {t.files}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin pb-2">
            <table className="w-full data-dense-table text-left text-xs whitespace-nowrap border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="px-4 py-3 font-bold">Номер / Дата</th>
                  <th className="px-4 py-3 font-bold">Тема</th>
                  <th className="px-4 py-3 font-bold">Продукт</th>
                  <th className="px-4 py-3 font-bold">Приоритет</th>
                  <th className="px-4 py-3 font-bold">Статус</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-100">
                {filtered.map(t => (
                  <tr key={t.id} onClick={() => { setEditingTicket(t); setTicketModalOpen(true); }} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                    <td className="px-4 py-3 font-mono text-slate-500 font-bold">{t.id}<br/><span className="text-[10px] text-gray-400 font-sans font-normal">{t.date}</span></td>
                    <td className="px-4 py-3 font-bold text-gray-900 group-hover:text-blue-600">{t.title}</td>
                    <td className="px-4 py-3 text-slate-500">{t.product}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        t.priority === 'Критический' ? 'bg-rose-50 text-rose-700' :
                        t.priority === 'Высокий' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                      }`}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-500">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} onClick={() => { setEditingTicket(t); setTicketModalOpen(true); }} className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between gap-4 cursor-pointer hover:border-blue-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600">{t.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                    <span className="font-mono">{t.id}</span>
                    <span>•</span>
                    <span>{t.date}</span>
                    <span>•</span>
                    <span>{t.product}</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-slate-500 text-xs font-bold rounded-lg">{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
