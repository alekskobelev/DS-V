import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Wrench, 
  ShieldCheck, 
  Download, 
  ArrowRight, 
  Activity, 
  Calendar, 
  FileText, 
  Calculator, 
  MessageSquare, 
  KeyRound, 
  Briefcase,
  FileArchive,
  CalendarDays,
  Clock,
  Sparkles,
  Check,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  downloadContractDocumentPackageZip, 
  downloadArshinVerificationIcsCalendar 
} from '../../utils/clientPortalExportUtils';

interface ClientDashboardProps {
  currentUser: UserProfile;
  onCreateTicket?: () => void;
  onOpenRfqModal?: () => void;
  onNavigateToSubTab?: (tabId: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  currentUser,
  onCreateTicket,
  onOpenRfqModal,
  onNavigateToSubTab
}) => {
  const { showToast } = useApp();
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isExportingIcs, setIsExportingIcs] = useState(false);

  const handleDownloadContractZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadContractDocumentPackageZip({
        contractNumber: 'ДОГ-2026-СМР/04',
        contractDate: '15.02.2026',
        customerName: currentUser.company || 'ПАО «ОДК-Кузнецов»',
        projectName: 'Поставка и пусконаладка мостовой КИМ Mitutoyo CRYSTA-Apex V9168',
        equipmentName: 'Координатно-измерительная машина Mitutoyo CRYSTA-Apex V9168',
        serialNumber: '841029',
        arshinNumber: '48291-24',
        verificationValidUntil: '15.11.2027',
        cncMachineModel: 'Hermle C42U MT Dynamic (Siemens 840D sl)',
        camSystem: 'TopSolid 7 CAM'
      });
      showToast('Комплект документов по договору успешно сформирован и скачан в ZIP-архиве!');
    } catch (err: any) {
      showToast('Ошибка при формировании архива: ' + (err.message || ''));
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleExportArshinIcs = (calendarType: 'standard' | 'myoffice') => {
    setIsExportingIcs(true);
    try {
      downloadArshinVerificationIcsCalendar([
        {
          brand: 'Mitutoyo',
          modelName: 'CRYSTA-Apex V9168',
          serialNumber: '841029',
          arshinNumber: '48291-24',
          validUntilDate: '2027-11-15',
          organization: currentUser.company
        },
        {
          brand: 'Shining 3D',
          modelName: 'FreeScan Combo Metrology',
          serialNumber: 'FS-2024-88',
          arshinNumber: '73210-23',
          validUntilDate: '2027-04-22',
          organization: currentUser.company
        },
        {
          brand: 'PMT',
          modelName: 'Alpha Arm 7-Axis 3.0m',
          serialNumber: 'PMT-A7-1044',
          arshinNumber: '81140-24',
          validUntilDate: '2027-08-30',
          organization: currentUser.company
        }
      ]);
      showToast(calendarType === 'myoffice' 
        ? 'Файл календаря (.ics) для МойОфис скачан! Импортируйте в модуль «Календарь»' 
        : 'Напоминания об окончании поверки ФГИС «АРШИН» экспортированы в календарь (.ics)!');
    } catch (err: any) {
      showToast('Ошибка при экспорте календаря');
    } finally {
      setIsExportingIcs(false);
    }
  };
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
              Клиентский B2B-портал
            </span>
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Личный кабинет
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-emerald-50">
            Кабинет клиента: <span className="text-emerald-700 dark:text-emerald-400">{currentUser.company || 'Ваша компания'}</span>
          </h2>
          <p className="text-sm text-emerald-800/80 dark:text-emerald-200/70 max-w-3xl leading-relaxed">
            Здравствуйте, {currentUser.fullName}. Здесь вы можете отслеживать статусы поставок, подавать заявки на расчет стоимости, скачивать закрывающие документы и оперативно обращаться в техподдержку.
          </p>
        </div>

        {/* Action Button inside Welcome Banner */}
        <div className="flex w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={onOpenRfqModal}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Заявка на расчет ТКП</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => onNavigateToSubTab?.('contracts')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Мои договоры</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Спецификации и график</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToSubTab?.('licenses')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-teal-400 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">Лицензии и ключи</div>
          <div className="text-[11px] text-slate-500 mt-0.5">PolyWorks & TopSolid</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToSubTab?.('requests')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Заявки и расчеты</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Калькуляция стоимости</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToSubTab?.('tickets')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">Техподдержка</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Сервисные заявки</div>
        </button>
      </div>

      {/* Active Deliveries Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Truck className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Активные поставки и проекты</h3>
        </div>

        {/* Mock Delivery Item */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                Договор: ДОГ-2026-СМР/04
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Поставка мостовой КИМ Mitutoyo CRYSTA-Apex V9168
              </h4>
              <div className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ожидаемая дата завершения: <strong className="text-slate-700 dark:text-slate-300">15.11.2026</strong>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Activity className="w-4 h-4 text-emerald-500" />
              Статус: В пути (Таможня)
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="relative px-2 md:px-6">
            <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full hidden sm:block" />
            <div className="absolute left-6 top-5 -translate-y-1/2 w-[55%] h-1 bg-blue-600 rounded-full transition-all duration-1000 hidden sm:block" />
            
            <div className="relative flex justify-between gap-2 sm:gap-4 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar">
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 text-center uppercase tracking-wider leading-tight">
                  Заказ<br/>размещен
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 text-center uppercase tracking-wider leading-tight">
                  Производство
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border-4 border-blue-50 dark:border-slate-800 shadow-sm ring-4 ring-blue-500/20 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 text-center uppercase tracking-wider leading-tight">
                  Доставка
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border-4 border-white dark:border-slate-900 shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider leading-tight">
                  Монтаж<br/>и ПНР
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 relative z-10 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border-4 border-white dark:border-slate-900 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider leading-tight">
                  Поверка<br/>АРШИН
                </div>
              </div>
            </div>
          </div>

          {/* 1-Click Batch Document Package Download (ZIP-Archive) */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FileArchive className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Пакетная выгрузка документации (ZIP-архив)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    1 клик
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-2xl">
                  Скачать полный комплект документов по договору ДОГ-2026-СМР/04: Акт ПНР, метрологический протокол 3D-контроля точности GD&T, свидетельство о поверке ФГИС «АРШИН» и постпроцессоры ЧПУ.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isDownloadingZip}
              onClick={handleDownloadContractZip}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingZip ? 'Сборка архива...' : 'Скачать весь комплект (ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ARSHIN Verification Calendar Synchronization Section */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-blue-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                ФГИС «АРШИН»
              </span>
              <span className="text-xs text-blue-300 font-medium">Синхронизация межповерочных интервалов СИ</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Синхронизация графиков поверки оборудования с календарями (.ics)
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Экспорт напоминаний об окончании межповерочных интервалов средств измерений вашего предприятия в Microsoft Outlook, Google Calendar, Apple Calendar или МойОфис. Система автоматически настроит уведомления за 30 дней и за 7 дней до даты окончания поверки.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Mitutoyo CRYSTA-Apex (№ 841029) • АРШИН № 48291-24</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Shining 3D FreeScan Combo (№ FS-2024-88)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>PMT Alpha Arm 7-Axis (№ PMT-A7-1044)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <button
              type="button"
              disabled={isExportingIcs}
              onClick={() => handleExportArshinIcs('standard')}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CalendarDays className="w-4 h-4 text-blue-200" />
              <span>Outlook / Google Calendar (.ics)</span>
            </button>
            <button
              type="button"
              disabled={isExportingIcs}
              onClick={() => handleExportArshinIcs('myoffice')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Calendar className="w-4 h-4 text-blue-200" />
              <span>МойОфис Календарь</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Documents */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Download className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Новые документы для скачивания</h3>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between group cursor-pointer border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <span className="font-black text-[10px]">PDF</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Счет-фактура №1123</div>
                  <div className="text-xs text-slate-500 mt-0.5">От 14.09.2026 • 245 КБ</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast('Загрузка документа «Счет-фактура №1123.pdf» начата');
                }}
                className="p-2 text-slate-400 group-hover:text-emerald-600 transition-colors cursor-pointer"
                title="Скачать документ"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between group cursor-pointer border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <span className="font-black text-[10px]">PDF</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Сертификат PolyWorks|Inspector</div>
                  <div className="text-xs text-slate-500 mt-0.5">От 01.09.2026 • 1.2 МБ</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast('Загрузка документа «Сертификат PolyWorks Inspector.pdf» начата');
                }}
                className="p-2 text-slate-400 group-hover:text-emerald-600 transition-colors cursor-pointer"
                title="Скачать документ"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Support quick link */}
        <div className="bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-300 dark:border-slate-800 shadow-xs text-slate-900 dark:text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">Техническая поддержка</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-sm">
              У вас есть вопросы по работе оборудования или требуется обновление лицензии `.v2c`? Создайте сервисное обращение, привязанное к вашему серийному номеру.
            </p>
          </div>
          <button 
            type="button"
            onClick={onCreateTicket}
            className="relative z-10 w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span>Подать сервисную заявку</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
