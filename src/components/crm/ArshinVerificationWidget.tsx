import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Building2, 
  Wrench, 
  Calendar, 
  ArrowUpRight, 
  Filter, 
  Plus, 
  ShieldAlert, 
  ShieldCheck,
  Search,
  Eye,
  FileCheck,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  getAllMonitoredEquipment, 
  ArshinEquipmentItem, 
  VerificationStatusType
} from '../../utils/arshinScheduleHelper';

interface ArshinVerificationWidgetProps {
  onOpenFullSchedule?: () => void;
  maxItems?: number;
  showCardHeader?: boolean;
}

export const ArshinVerificationWidget: React.FC<ArshinVerificationWidgetProps> = ({
  onOpenFullSchedule,
  maxItems = 6,
  showCardHeader = true
}) => {
  const { fleetDevices, deals, addDeal, showToast, setCurrentPage } = useApp();

  const [parkFilter, setParkFilter] = useState<'all' | 'company' | 'client'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'attention_only' | 'expired'>('attention_only');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingDealId, setIsCreatingDealId] = useState<string | null>(null);

  // Combine and sort all equipment
  const allEquipment = useMemo(() => {
    // «сегодня» берётся из фактической даты (см. src/utils/verificationStatus.ts)
    return getAllMonitoredEquipment(fleetDevices, deals);
  }, [fleetDevices, deals]);

  // KPI counters
  const counts = useMemo(() => {
    const total = allEquipment.length;
    const expired = allEquipment.filter(i => i.status === 'expired').length;
    const critical = allEquipment.filter(i => i.status === 'critical').length;
    const warning = allEquipment.filter(i => i.status === 'warning').length;
    const valid = allEquipment.filter(i => i.status === 'valid').length;
    const companyCount = allEquipment.filter(i => i.ownerType === 'company').length;
    const clientCount = allEquipment.filter(i => i.ownerType === 'client').length;

    return { total, expired, critical, warning, valid, companyCount, clientCount };
  }, [allEquipment]);

  // Filtered equipment
  const filteredEquipment = useMemo(() => {
    return allEquipment.filter(item => {
      // Park filter
      if (parkFilter === 'company' && item.ownerType !== 'company') return false;
      if (parkFilter === 'client' && item.ownerType !== 'client') return false;

      // Urgency filter
      if (urgencyFilter === 'expired' && item.status !== 'expired') return false;
      // «Внимание» = просрочено, срочно, а также неизвестный срок: прибор с битой/пустой
      // датой нельзя считать плановым — на экране «График поверок» он виден, и виджет
      // не должен его скрывать (иначе два экрана снова расходятся).
      if (urgencyFilter === 'attention_only' && item.status !== 'expired' && item.status !== 'critical' && item.status !== 'unknown') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          item.modelName.toLowerCase().includes(q) ||
          item.serialNumber.toLowerCase().includes(q) ||
          item.ownerName.toLowerCase().includes(q) ||
          item.verificationNumber.toLowerCase().includes(q) ||
          item.responsiblePerson.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [allEquipment, parkFilter, urgencyFilter, searchQuery]);

  const displayedEquipment = maxItems ? filteredEquipment.slice(0, maxItems) : filteredEquipment;

  // Handle rapid creation of service deal for verification
  const handleCreateVerificationDeal = async (item: ArshinEquipmentItem) => {
    try {
      setIsCreatingDealId(item.id);
      const dealId = `СДЕЛКА-2026-ПОВ-${Math.floor(100 + Math.random() * 900)}`;

      const isCompanyDevice = item.ownerType === 'company';
      const companyName = isCompanyDevice ? 'ООО «ДС-Инжиниринг» (Внутреннее ТО)' : item.ownerName;
      const contactName = isCompanyDevice ? item.responsiblePerson : (item.contactPerson || 'Главный метролог');
      const phone = isCompanyDevice ? '+7 (846) 219-25-88' : (item.contactPhone || '+7 (846) 954-00-00');
      const email = isCompanyDevice ? 'metrology@ds-engineering.ru' : (item.contactEmail || 'info@client.ru');

      const newDeal = {
        id: dealId,
        customerName: contactName,
        companyName: companyName,
        inn: item.ownerInn || '6312999000',
        phone: phone,
        email: email,
        funnel: 'support' as const,
        stage: 'ticket',
        serviceType: `Поверка и калибровка в ФГИС «АРШИН»: ${item.modelName} (зав. № ${item.serialNumber})`,
        details: `Автоматически зарегистрировано из мониторинга поверок ФГИС «АРШИН». Состояние: ${item.statusLabel}. Срок свидетельства: ${item.verificationValidUntil}. Предыдущий номер АРШИН: ${item.verificationNumber}. Требуется выезд поверителя / доставка в метрологический зал.`,
        estimatedPrice: item.category.includes('Трекер') ? 420000 : item.category.includes('рука') ? 350000 : 250000,
        currency: 'RUB' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByManager: 'Робот мониторинга АРШИН',
        responsibleManager: item.responsiblePerson || 'Скобелев А.С.',
        clientEquipment: {
          model: item.modelName,
          serialNumber: item.serialNumber,
          warrantyUntil: item.verificationValidUntil,
          verificationDate: item.verificationValidUntil,
          daysUntilVerification: item.daysLeft > 0 ? item.daysLeft : 0
        },
        utm: { source: 'arshin_monitoring', medium: 'crm_widget', campaign: 'fgis_arshin_schedule' },
        items: [
          {
            id: `item_ver_${Date.now()}`,
            name: `Метрологическая поверка СИ ${item.modelName} (ФГИС «АРШИН»)`,
            category: 'Метрология',
            quantity: 1,
            price: item.category.includes('Трекер') ? 420000 : item.category.includes('рука') ? 350000 : 250000,
            paymentStatus: 'pending' as const
          }
        ],
        timeline: [
          {
            id: `t_${Date.now()}`,
            date: new Date().toLocaleString('ru-RU'),
            title: 'Заявка на поверку сформирована из графика ФГИС «АРШИН»',
            author: 'Модуль мониторинга ФГИС «АРШИН»',
            type: 'system' as const,
            comment: `Прибор: ${item.modelName} (зав. № ${item.serialNumber}). Статус свидетельства: ${item.statusLabel}.`
          }
        ],
        documents: []
      };

      addDeal(newDeal);
      showToast(`Сервисная сделка ${dealId} на поверку ${item.serialNumber} создана в CRM!`);
    } catch (e) {
      console.error(e);
      showToast('Ошибка создания сделки');
    } finally {
      setIsCreatingDealId(null);
    }
  };

  return (
    <div id="arshin-verification-widget" className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header */}
      {showCardHeader && (
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:to-slate-850">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-600/20 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  График поверок ФГИС «АРШИН»
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  {counts.expired + counts.critical} в зоне риска
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Автоматический мониторинг межповерочных интервалов собственного и клиентского парка КИМ и 3D-сканеров
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {onOpenFullSchedule && (
              <button
                type="button"
                onClick={onOpenFullSchedule}
                className="h-9 px-4.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Полный график (Ганта)</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800">
        {/* Expired KPI */}
        <button
          type="button"
          onClick={() => setUrgencyFilter('expired')}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            urgencyFilter === 'expired'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400/40'
              : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${urgencyFilter === 'expired' ? 'text-rose-100' : 'text-rose-600'}`}>
              Просрочено!
            </span>
            <AlertTriangle className={`w-4 h-4 ${urgencyFilter === 'expired' ? 'text-white' : 'text-rose-600'}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-1 font-mono ${urgencyFilter === 'expired' ? 'text-white' : 'text-rose-700 dark:text-rose-400'}`}>
            {counts.expired} СИ
          </div>
          <div className={`text-[10px] mt-0.5 ${urgencyFilter === 'expired' ? 'text-rose-100' : 'text-slate-500'}`}>
            Запрещена эксплуатация по 102-ФЗ
          </div>
        </button>

        {/* Critical KPI */}
        <button
          type="button"
          onClick={() => setUrgencyFilter('attention_only')}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            urgencyFilter === 'attention_only'
              ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-400/40'
              : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/60 hover:bg-red-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${urgencyFilter === 'attention_only' ? 'text-red-100' : 'text-red-600'}`}>
              Срочно (до 30 дн.)
            </span>
            <Clock className={`w-4 h-4 ${urgencyFilter === 'attention_only' ? 'text-white' : 'text-red-600'}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-1 font-mono ${urgencyFilter === 'attention_only' ? 'text-white' : 'text-red-700 dark:text-red-400'}`}>
            {counts.critical} СИ
          </div>
          <div className={`text-[10px] mt-0.5 ${urgencyFilter === 'attention_only' ? 'text-red-100' : 'text-slate-500'}`}>
            Требуется вызов поверителя
          </div>
        </button>

        {/* Warning KPI */}
        <button
          type="button"
          onClick={() => setUrgencyFilter('all')}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            urgencyFilter === 'all'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${urgencyFilter === 'all' ? 'text-amber-100' : 'text-amber-700 dark:text-amber-400'}`}>
              Плановый период (31–60 дн.)
            </span>
            <Calendar className={`w-4 h-4 ${urgencyFilter === 'all' ? 'text-white' : 'text-amber-600'}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-1 font-mono ${urgencyFilter === 'all' ? 'text-white' : 'text-amber-700 dark:text-amber-400'}`}>
            {counts.warning} СИ
          </div>
          <div className={`text-[10px] mt-0.5 ${urgencyFilter === 'all' ? 'text-amber-100' : 'text-slate-500'}`}>
            Согласование графика ТО
          </div>
        </button>

        {/* Valid KPI */}
        <button
          type="button"
          onClick={() => setUrgencyFilter('all')}
          className="p-3 rounded-lg border bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 text-left transition-all hover:bg-emerald-50/40 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Действуют (&gt; 60 дн.)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1 font-mono text-emerald-700 dark:text-emerald-400">
            {counts.valid} СИ
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Всего на контроле: {counts.total} ед.
          </div>
        </button>
      </div>

      {/* Filter and Switcher Strip */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Park Type Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setParkFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              parkFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Весь парк ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => setParkFilter('company')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              parkFilter === 'company'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Собственный парк ({counts.companyCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setParkFilter('client')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              parkFilter === 'client'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Парк заказчиков ({counts.clientCount})</span>
          </button>
        </div>

        {/* Search & Urgency Filter */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Поиск по модели, зав. №, заводу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as any)}
            className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="attention_only">Внимание (Красный)</option>
            <option value="expired">Только просроченные</option>
            <option value="all">Все статусы</option>
          </select>
        </div>
      </div>

      {/* Equipment List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {displayedEquipment.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-white">
              В выбранной категории нет приборов с нарушениями срока поверки
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Все свидетельства действуют в пределах установленного межповерочного интервала. Выберите фильтр «Все статусы», чтобы просмотреть действующие приборы.
            </p>
          </div>
        ) : (
          displayedEquipment.map(item => {
            const isCritical = item.status === 'expired' || item.status === 'critical';
            const isCompany = item.ownerType === 'company';

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${
                  item.rowHighlightClass || 'hover:bg-slate-50/80 dark:hover:bg-slate-850/50'
                }`}
              >
                {/* Left info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${item.badgeClass}`}>
                      {item.status === 'expired' ? (
                        <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                      ) : item.status === 'critical' ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5" />
                      )}
                      <span>{item.statusLabel}</span>
                    </span>

                    {/* Owner Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isCompany 
                        ? 'bg-blue-50 text-blue-800 border-blue-200' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {item.ownerName}
                    </span>

                    {/* Category */}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.category}
                    </span>
                  </div>

                  {/* Device Title & Serial */}
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                      <span>{item.modelName}</span>
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        Зав. № {item.serialNumber}
                      </span>
                      {item.inventoryNumber && (
                        <span className="font-mono text-[11px] text-slate-400">
                          ({item.inventoryNumber})
                        </span>
                      )}
                    </h4>
                  </div>

                  {/* Details Subline */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400">Свидетельство ФГИС АРШИН:</span>{' '}
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                        {item.verificationNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Срок действия:</span>{' '}
                      <span className={`font-bold font-mono ${isCritical ? 'text-rose-600 font-black' : 'text-slate-800 dark:text-slate-100'}`}>
                        до {new Date(item.verificationValidUntil).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    {item.currentLocation && (
                      <div className="truncate max-w-xs text-slate-500">
                        📍 {item.currentLocation}
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">Ответственный:</span> {item.responsiblePerson}
                    </div>
                  </div>

                  {/* Notes / Alert Warning */}
                  {item.notes && (
                    <div className={`text-[11px] rounded-lg p-2 mt-1 leading-relaxed ${
                      item.status === 'expired'
                        ? 'bg-rose-100/90 text-rose-950 font-bold border border-rose-300'
                        : item.status === 'critical'
                        ? 'bg-amber-100/80 text-amber-950 font-semibold border border-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'
                    }`}>
                      {item.notes}
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                  {/* FGIS Arshin link */}
                  <a
                    href={item.arshinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 sm:h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Проверить запись о поверке в Федеральном информационном фонде ФГИС «АРШИН»"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">В АРШИН</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  {/* Create service deal */}
                  <button
                    type="button"
                    onClick={() => handleCreateVerificationDeal(item)}
                    disabled={isCreatingDealId === item.id}
                    className={`h-8 sm:h-9 px-4.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                      isCritical
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                    }`}
                    title="Создать сервисную сделку в воронку Сервис и ТО для согласования выезда и поверки"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Сделка на поверку</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer bar */}
      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Метрологический надзор соответствует требованиям Федерального закона № 102-ФЗ «Об обеспечении единства измерений» и ГОСТ Р 8.568.
          </span>
        </div>
        {onOpenFullSchedule && (
          <button
            type="button"
            onClick={onOpenFullSchedule}
            className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Посмотреть все {allEquipment.length} СИ на диаграмме Ганта</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
