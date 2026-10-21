import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Key, Edit, Trash2, Maximize2, Minimize2, X, Plus, ShieldCheck, Server, Cpu, Clock, Users, Copy, Check } from 'lucide-react';
import { RegistryToolbar } from '../common/RegistryToolbar';
import { exportTableToPdf } from '../../utils/exportTablePdf';

export interface LicensesRegistryProps {
  licenses: any[];
  canManageLicenses?: boolean;
  onEdit?: (lic: any, e: React.MouseEvent) => void;
  onDelete?: (licId: string, e: React.MouseEvent) => void;
  onAdd?: () => void;
  onRequestSupportExtension?: (lic: any) => void;
  renderAdditionalDetails?: (lic: any) => React.ReactNode;
}

export const LicensesRegistry: React.FC<LicensesRegistryProps> = ({ 
  licenses,
  canManageLicenses = false,
  onEdit,
  onDelete,
  onAdd,
  onRequestSupportExtension,
  renderAdditionalDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list'>('list');
  const [selectedLicense, setSelectedLicense] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedHasp, setCopiedHasp] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedLicense) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedLicense]);

  const filtered = licenses.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.haspId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.type && l.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopyHasp = (haspId: string) => {
    navigator.clipboard?.writeText(haspId);
    setCopiedHasp(true);
    setTimeout(() => setCopiedHasp(false), 2000);
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportTableToPdf({
        title: 'Реестр лицензий и аппаратных ключей защиты',
        subtitle: 'ООО «ДС-Инжиниринг» • Департамент CAD/CAM ПО (TopSolid, PolyWorks, GOM)',
        department: 'Служба лицензирования и защиты ПО',
        filterInfo: searchQuery ? `Фильтр по поиску: "${searchQuery}"` : 'Полный реестр',
        summaryBadges: [
          { label: 'Всего лицензий', value: filtered.length, color: 'teal' },
          { label: 'Сетевые PDM', value: filtered.filter(l => (l.type || '').toLowerCase().includes('сетев')).length, color: 'blue' },
          { label: 'Локальные USB', value: filtered.filter(l => (l.type || '').toLowerCase().includes('локал') || (l.type || '').toLowerCase().includes('usb')).length, color: 'slate' },
          { label: 'Активных', value: filtered.filter(l => (l.status || '').toLowerCase().includes('актив')).length, color: 'green' }
        ],
        headers: ['№', 'Продукт / Модуль', 'Тип лицензии', 'HASP / Dongle ID', 'Сервер / Хост', 'Мест', 'Статус'],
        rows: filtered.map((lic, idx) => [
          String(idx + 1),
          { text: lic.title, subtext: lic.description || lic.serialNumber },
          { text: lic.type, badge: true, color: 'teal' },
          String(lic.haspId || '—'),
          String(lic.server || 'Локальный ПК'),
          String(lic.seats || '1'),
          { 
            text: lic.status || 'Активна', 
            badge: true, 
            color: (lic.status || '').toLowerCase().includes('истек') ? 'rose' : (lic.status || '').toLowerCase().includes('продл') ? 'amber' : 'emerald' 
          }
        ]),
        columnAlignments: ['center', 'left', 'center', 'left', 'left', 'center', 'center'],
        columnWidths: ['5%', '28%', '16%', '16%', '15%', '10%', '10%'],
        orientation: 'landscape',
        filename: `Reestr_Litsenzii_DS_Engineering_${new Date().toISOString().slice(0, 10)}.pdf`
      });
    } catch (err) {
      console.error('Failed to export licenses PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Лицензии и аппаратные ключи защиты</h2>
            <p className="text-xs text-gray-500 mt-0.5">Управление электронными и аппаратными ключами HASP HL, Sentinel, файлами .v2c и сетевыми PDM-серверами</p>
          </div>
        </div>
        
        {canManageLicenses && onAdd && (
          <button 
            onClick={onAdd}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-teal-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Добавить лицензию
          </button>
        )}
      </div>

      <RegistryToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalCount={filtered.length}
        searchPlaceholder="Поиск по ключу, продукту..."
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
      />

      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((lic) => (
            <div 
              key={lic.id} 
              onClick={() => setSelectedLicense(lic)}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-teal-100 text-teal-900 rounded-md font-bold text-xs border border-teal-200">{lic.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold border border-emerald-100">{lic.status}</span>
                    {canManageLicenses && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit?.(lic, e); }}
                          className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Редактировать лицензию"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete?.(lic.id, e); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Удалить лицензию"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight hover:text-teal-700 transition-colors">{lic.title}</h3>
                <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 space-y-2 text-[11px]">
                  <div className="flex flex-col"><span className="text-gray-500 font-medium">HASP ID:</span><span className="font-mono font-bold text-gray-800">{lic.haspId}</span></div>
                  <div className="flex flex-col"><span className="text-gray-500 font-medium">Рабочих мест:</span><span className="text-gray-800 font-semibold">{lic.seats}</span></div>
                  <div className="flex flex-col"><span className="text-gray-500 font-medium">Сервер лицензий:</span><span className="text-gray-800 font-semibold">{lic.server}</span></div>
                  <div className="flex flex-col"><span className="text-gray-500 font-medium">Оборудование:</span><span className="text-gray-800 font-semibold">{lic.hardware}</span></div>
                  <div className="flex flex-col"><span className="text-gray-500 font-medium">Срок техподдержки:</span><span className="text-gray-800 font-semibold">{lic.supportExpiry}</span></div>
                </div>
                {renderAdditionalDetails?.(lic)}
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <p className="text-[10px] text-gray-400 italic line-clamp-1">{lic.description}</p>
                <span className="text-teal-600 font-bold hover:underline shrink-0 ml-2">Подробнее →</span>
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
                  <th className="px-4 py-3 font-bold">Продукт</th>
                  <th className="px-4 py-3 font-bold">Тип</th>
                  <th className="px-4 py-3 font-bold">HASP ID / Сервер</th>
                  <th className="px-4 py-3 font-bold">Мест</th>
                  <th className="px-4 py-3 font-bold">Статус</th>
                  <th className="px-4 py-3 font-bold text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-100">
                {filtered.map(lic => (
                  <tr 
                    key={lic.id} 
                    onClick={() => setSelectedLicense(lic)}
                    className="hover:bg-teal-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-gray-900">{lic.title}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] font-bold border border-teal-100">{lic.type}</span></td>
                    <td className="px-4 py-3 font-mono text-slate-500">{lic.haspId}<br/><span className="text-[10px] text-gray-400">{lic.server}</span></td>
                    <td className="px-4 py-3 font-semibold text-slate-500">{lic.seats}</td>
                    <td className="px-4 py-3"><span className="text-emerald-600 font-bold">{lic.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManageLicenses && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEdit?.(lic, e); }}
                              className="p-1 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors cursor-pointer"
                              title="Редактировать"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDelete?.(lic.id, e); }}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLicense(lic);
                          }}
                          className="text-teal-600 hover:text-teal-800 font-bold text-xs px-2 py-1 bg-teal-50 hover:bg-teal-100 rounded-lg"
                        >
                          Открыть
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-3">
          {filtered.map(lic => (
            <div 
              key={lic.id} 
              onClick={() => setSelectedLicense(lic)}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between gap-4 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm hover:text-teal-700">{lic.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                    <span className="font-mono">{lic.haspId}</span>
                    <span>•</span>
                    <span>{lic.seats} мест</span>
                    <span>•</span>
                    <span>{lic.server}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">{lic.status}</span>
                {canManageLicenses && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit?.(lic, e); }}
                      className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                      title="Редактировать"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete?.(lic.id, e); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <span className="text-teal-600 font-bold text-xs hidden sm:inline px-2 py-1 bg-teal-50 hover:bg-teal-100 rounded-lg">Открыть →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standardized License Modal with Fullscreen Support: Rendered via Portal at document.body with z-[9999] */}
      {selectedLicense && createPortal(
        <div 
          onClick={() => setSelectedLicense(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`${isFullscreen ? 'fixed inset-0 z-[10000] w-screen h-screen max-w-none max-h-none rounded-none' : 'relative max-w-2xl w-full h-auto max-h-[92vh] rounded-lg sm:rounded-lg'} bg-white shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-start justify-between gap-3 border-b border-slate-800 shrink-0">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-teal-500 text-slate-950 text-[11px] font-bold rounded-full">
                    {selectedLicense.type}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold rounded-full">
                    {selectedLicense.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-snug">
                  {selectedLicense.title}
                </h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(prev => !prev)}
                  title={isFullscreen ? "Свернуть в окно" : "На весь экран"}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLicense(null)}
                  aria-label="Закрыть"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg">
                  <div className="text-[11px] text-gray-500 font-medium">HASP ID / Ключ защиты:</div>
                  <div className="font-mono font-bold text-gray-900 mt-0.5 flex items-center justify-between">
                    <span>{selectedLicense.haspId}</span>
                    <button 
                      onClick={() => handleCopyHasp(selectedLicense.haspId)}
                      className="text-teal-600 hover:text-teal-800 p-1 cursor-pointer"
                      title="Скопировать"
                    >
                      {copiedHasp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg">
                  <div className="text-[11px] text-gray-500 font-medium">Рабочих мест / Лицензий:</div>
                  <div className="font-bold text-gray-900 mt-0.5">{selectedLicense.seats}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg">
                  <div className="text-[11px] text-gray-500 font-medium">Сервер лицензий / PDM:</div>
                  <div className="font-semibold text-gray-900 mt-0.5">{selectedLicense.server}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg">
                  <div className="text-[11px] text-gray-500 font-medium">Привязанное оборудование:</div>
                  <div className="font-semibold text-gray-900 mt-0.5">{selectedLicense.hardware}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg sm:col-span-2">
                  <div className="text-[11px] text-gray-500 font-medium">Срок действия техподдержки:</div>
                  <div className="font-semibold text-emerald-700 mt-0.5">{selectedLicense.supportExpiry}</div>
                </div>
              </div>

              {selectedLicense.description && (
                <div className="p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-lg">
                  <div className="text-xs font-bold text-teal-950 mb-1">Описание и назначение лицензии:</div>
                  <p className="text-xs text-teal-900 leading-relaxed">{selectedLicense.description}</p>
                </div>
              )}

              <div className="p-3 bg-blue-50/50 border border-blue-200/60 rounded-lg flex items-start gap-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Электронная активация и диагностика HASP</div>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Для обновления ключей .v2c или сетевого мониторинга используйте консоль Sentinel Admin Control Center (порт :1947) или обратитесь в службу сопровождения ДС-Инжиниринг.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyHasp(selectedLicense.haspId)}
                  className="px-3.5 py-2 bg-white hover:bg-gray-100 text-slate-700 border border-gray-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copiedHasp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHasp ? 'Скопировано' : 'Копировать HASP ID'}</span>
                </button>

                {onRequestSupportExtension && (
                  <button
                    type="button"
                    onClick={() => {
                      const lic = selectedLicense;
                      setSelectedLicense(null);
                      onRequestSupportExtension(lic);
                    }}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Запросить продление ТП</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedLicense(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer ml-auto"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
