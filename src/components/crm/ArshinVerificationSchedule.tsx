import React, { useState, useMemo, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Building2, 
  Wrench, 
  Calendar, 
  Printer, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Info, 
  ArrowLeft, 
  FileCheck, 
  ChevronRight, 
  Check, 
  X, 
  Activity,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  Edit3,
  Trash2,
  Save,
  User,
  MapPin,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CrmDocumentationModal } from './CrmDocumentationModal';
import { 
  getAllMonitoredEquipment, 
  ArshinEquipmentItem, 
  VerificationStatusType, 
  exportScheduleToCsv,
  formatArshinUrl,
  calculateVerificationStatus
} from '../../utils/arshinScheduleHelper';
import { CompanyFleetDevice } from '../../types';
import { exportTableToPdf } from '../../utils/exportTablePdf';
import { parseVerificationDate } from '../../utils/verificationStatus';

// Окно диаграммы Ганта строится от фактической даты: 8 месяцев, из которых 2 — уже прошедшие,
// чтобы просроченные поверки были видны слева от маркера «сегодня», а не прижимались к границе.
const TIMELINE_MONTH_COUNT = 8;
const TIMELINE_BACKFILL_MONTHS = 2;
const MONTH_LABELS_SHORT_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

interface ArshinVerificationScheduleProps {
  onBackToCrm?: () => void;
}

export const ArshinVerificationSchedule: React.FC<ArshinVerificationScheduleProps> = ({
  onBackToCrm
}) => {
  const { currentUser, fleetDevices, deals, addFleetDevice, updateFleetDevice, deleteFleetDevice, addDeal, showToast } = useApp();

  const [parkFilter, setParkFilter] = useState<'all' | 'company' | 'client'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical_only' | 'expired_only' | 'warning' | 'valid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'table'>('table');
  const [selectedItem, setSelectedItem] = useState<ArshinEquipmentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalTab, setDocModalTab] = useState<'arshin' | 'intervals'>('arshin');

  // Edit and Delete state
  const [editingItem, setEditingItem] = useState<ArshinEquipmentItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ArshinEquipmentItem | null>(null);

  // New item form state
  const [newDevice, setNewDevice] = useState({
    modelName: '',
    brand: '',
    category: 'Координатно-измерительные машины',
    serialNumber: '',
    inventoryNumber: '',
    ownerType: 'client' as 'company' | 'client',
    ownerName: '',
    verificationNumber: '',
    verificationDate: '2025-10-01',
    verificationValidUntil: '2026-10-01',
    responsiblePerson: '',
    currentLocation: '',
    accuracy: 'до 0.020 мм',
    notes: ''
  });

  // Calculate combined items
  const allItems = useMemo(() => {
    // «сегодня» — фактическая дата (единый расчёт: src/utils/verificationStatus.ts)
    return getAllMonitoredEquipment(fleetDevices, deals);
  }, [fleetDevices, deals]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = allItems.length;
    const expired = allItems.filter(i => i.status === 'expired').length;
    const critical = allItems.filter(i => i.status === 'critical').length;
    const warning = allItems.filter(i => i.status === 'warning').length;
    const valid = allItems.filter(i => i.status === 'valid').length;
    const unknown = allItems.filter(i => i.status === 'unknown').length;
    const companyCount = allItems.filter(i => i.ownerType === 'company').length;
    const clientCount = allItems.filter(i => i.ownerType === 'client').length;

    return { total, expired, critical, warning, valid, unknown, companyCount, clientCount };
  }, [allItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Park filter
      if (parkFilter === 'company' && item.ownerType !== 'company') return false;
      if (parkFilter === 'client' && item.ownerType !== 'client') return false;

      // Urgency filter
      if (urgencyFilter === 'expired_only' && item.status !== 'expired') return false;
      if (urgencyFilter === 'critical_only' && item.status !== 'expired' && item.status !== 'critical') return false;
      if (urgencyFilter === 'warning' && item.status !== 'warning') return false;
      if (urgencyFilter === 'valid' && item.status !== 'valid') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          item.modelName.toLowerCase().includes(q) ||
          item.serialNumber.toLowerCase().includes(q) ||
          item.ownerName.toLowerCase().includes(q) ||
          item.verificationNumber.toLowerCase().includes(q) ||
          item.responsiblePerson.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allItems, parkFilter, urgencyFilter, searchQuery]);

  // Окно графика и позиции маркеров — считаются один раз за монтирование экрана
  const scheduleWindow = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth() - TIMELINE_BACKFILL_MONTHS, 1);
    const months = Array.from({ length: TIMELINE_MONTH_COUNT }, (_, i) => {
      const first = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
      return {
        key: `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}`,
        label: `${MONTH_LABELS_SHORT_RU[first.getMonth()]} ${first.getFullYear()}`,
        start: first,
        end: last,
        isCurrent: first.getFullYear() === now.getFullYear() && first.getMonth() === now.getMonth()
      };
    });

    const rangeStart = months[0].start.getTime();
    const rangeEnd = new Date(
      months[months.length - 1].start.getFullYear(),
      months[months.length - 1].start.getMonth() + 1,
      1
    ).getTime();
    const span = rangeEnd - rangeStart;

    return {
      months,
      rangeStart,
      rangeEnd,
      todayPercent: Math.min(98, Math.max(2, ((now.getTime() - rangeStart) / span) * 100)),
      todayLabel: now.toLocaleDateString('ru-RU')
    };
  }, []);

  const timelineMonths = scheduleWindow.months;

  // Handle Quick Service Deal Creation
  const handleCreateVerificationDeal = (item: ArshinEquipmentItem) => {
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
      serviceType: `Поверка и калибровка в ФГИС «АРШИН»: ${item.modelName} (${item.serialNumber})`,
      details: `Заявка сформирована из Графика поверок ФГИС «АРШИН». Состояние: ${item.statusLabel}. Срок свидетельства: ${item.verificationValidUntil}. Номер записи АРШИН: ${item.verificationNumber}. Требуется проведение регламентного ТО и метрологической поверки.`,
      estimatedPrice: item.category.includes('Трекер') ? 420000 : item.category.includes('рука') ? 350000 : 250000,
      currency: 'RUB' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByManager: 'График поверок АРШИН',
      responsibleManager: item.responsiblePerson || 'Скобелев А.С.',
      clientEquipment: {
        model: item.modelName,
        serialNumber: item.serialNumber,
        warrantyUntil: item.verificationValidUntil,
        verificationDate: item.verificationValidUntil,
        daysUntilVerification: item.daysLeft > 0 ? item.daysLeft : 0
      },
      utm: { source: 'arshin_schedule', medium: 'crm_schedule_module', campaign: 'arshin_fgis' },
      items: [
        {
          id: `item_ver_${Date.now()}`,
          name: `Метрологическая поверка и ТО ${item.modelName}`,
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
          title: 'Зарегистрирована заявка на поверку СИ',
          author: 'ФГИС «АРШИН» Модуль',
          type: 'system' as const,
          comment: `Прибор: ${item.modelName} (зав. № ${item.serialNumber}). Статус: ${item.statusLabel}.`
        }
      ],
      documents: []
    };

    addDeal(newDeal);
    showToast(`Сервисная сделка ${dealId} на поверку СИ успешно создана в CRM!`);
  };

  // Handle Add New Device
  const handleSaveNewDevice = () => {
    if (!newDevice.modelName || !newDevice.serialNumber) {
      showToast('Заполните модель и заводской номер прибора');
      return;
    }

    const deviceId = `fleet-custom-${Date.now()}`;
    const newFleetDev: CompanyFleetDevice = {
      id: deviceId,
      modelName: newDevice.modelName,
      brand: newDevice.brand || 'Метрологический изготовитель',
      category: newDevice.category,
      serialNumber: newDevice.serialNumber,
      inventoryNumber: newDevice.inventoryNumber || `ИНВ-${Math.floor(100 + Math.random() * 900)}`,
      status: 'in_office',
      statusLabel: newDevice.ownerType === 'company' ? 'В метрологическом зале' : 'На предприятии заказчика',
      verificationNumber: newDevice.verificationNumber || `С-АРШИН/2025/${newDevice.serialNumber}`,
      verificationDate: newDevice.verificationDate,
      verificationValidUntil: newDevice.verificationValidUntil,
      accuracy: newDevice.accuracy,
      currentLocation: newDevice.currentLocation || (newDevice.ownerType === 'company' ? 'Самара, ул. Свободы, 198' : newDevice.ownerName),
      responsiblePerson: newDevice.responsiblePerson || 'Инженер-метролог «ДС-Инжиниринг»',
      notes: newDevice.notes || `Владелец: ${newDevice.ownerType === 'company' ? 'ООО «ДС-Инжиниринг»' : newDevice.ownerName}`
    };

    addFleetDevice(newFleetDev);
    showToast(`Прибор ${newDevice.modelName} внесен в реестр поверок!`);
    setIsAddModalOpen(false);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (item: ArshinEquipmentItem) => {
    setEditingItem(JSON.parse(JSON.stringify(item)));
    setIsEditModalOpen(true);
  };

  // Handle Save Edited Device
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editingItem.modelName || !editingItem.serialNumber) {
      showToast('Заполните наименование модели и заводской номер');
      return;
    }

    const inFleet = fleetDevices.some(d => d.id === editingItem.sourceId || d.id === editingItem.id || d.serialNumber === editingItem.serialNumber);
    if (inFleet) {
      const targetId = fleetDevices.find(d => d.id === editingItem.sourceId || d.id === editingItem.id || d.serialNumber === editingItem.serialNumber)?.id;
      if (targetId) {
        await updateFleetDevice(targetId, {
          modelName: editingItem.modelName,
          brand: editingItem.brand,
          category: editingItem.category,
          serialNumber: editingItem.serialNumber,
          inventoryNumber: editingItem.inventoryNumber,
          verificationNumber: editingItem.verificationNumber,
          verificationDate: editingItem.verificationDate,
          verificationValidUntil: editingItem.verificationValidUntil,
          accuracy: editingItem.accuracy,
          currentLocation: editingItem.currentLocation,
          responsiblePerson: editingItem.responsiblePerson,
          notes: editingItem.notes
        });
      }
    } else {
      // Add or update to fleet devices so that it persists
      const newFleetDev: CompanyFleetDevice = {
        id: editingItem.sourceId || editingItem.id || `dev-${Date.now()}`,
        modelName: editingItem.modelName,
        brand: editingItem.brand || 'Изготовитель СИ',
        category: editingItem.category,
        serialNumber: editingItem.serialNumber,
        inventoryNumber: editingItem.inventoryNumber || '',
        status: 'in_office',
        statusLabel: editingItem.ownerType === 'company' ? 'В парке компании' : 'На предприятии заказчика',
        verificationNumber: editingItem.verificationNumber,
        verificationDate: editingItem.verificationDate,
        verificationValidUntil: editingItem.verificationValidUntil,
        accuracy: editingItem.accuracy,
        currentLocation: editingItem.currentLocation,
        responsiblePerson: editingItem.responsiblePerson,
        notes: editingItem.notes
      };
      await addFleetDevice(newFleetDev);
    }

    showToast(`Данные СИ «${editingItem.modelName}» успешно обновлены!`);
    setIsEditModalOpen(false);

    if (selectedItem && (selectedItem.id === editingItem.id || selectedItem.serialNumber === editingItem.serialNumber)) {
      setSelectedItem({
        ...selectedItem,
        ...editingItem,
        ...calculateVerificationStatus(editingItem.verificationValidUntil),
        arshinUrl: formatArshinUrl(editingItem.verificationNumber, editingItem.serialNumber)
      });
    }
    setEditingItem(null);
  };

  // Handle Delete Device
  const handleDeleteItem = async (item: ArshinEquipmentItem) => {
    const target = fleetDevices.find(d => d.id === item.sourceId || d.id === item.id || d.serialNumber === item.serialNumber);
    if (target) {
      await deleteFleetDevice(target.id);
    }
    showToast(`СИ «${item.modelName}» удалено из метрологического графика`);
    setDeleteConfirmItem(null);
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }
  };

  // Helper for Gantt bar positioning
  /**
   * Позиция маркера срока поверки на шкале графика (в %).
   *
   * Ранее окно было захардкожено (01.08.2026…31.03.2027), из-за чего любое значение вне
   * диапазона прижималось к 2 %/98 % — просроченный на год прибор выглядел «на границе
   * плана». Теперь окно следует за фактической датой (см. scheduleWindow).
   * Возвращает всегда число: прежний вариант для пустой даты отдавал объект
   * `{ left: '0%', width: '10%' }`, и в `style={{ left: `${markerPercent}%` }}`
   * подставлялось «[object Object]%'».
   */
  const getTimelineBarPosition = (validUntilStr?: string): number => {
    const parsed = parseVerificationDate(validUntilStr);
    if (!parsed) return 0;

    const totalMs = scheduleWindow.rangeEnd - scheduleWindow.rangeStart;
    let percent = ((parsed.getTime() - scheduleWindow.rangeStart) / totalMs) * 100;
    if (percent < 2) percent = 2;
    if (percent > 98) percent = 98;
    return percent;
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportTableToPdf({
        title: 'График поверки СИ и мониторинг ФГИС «АРШИН»',
        subtitle: 'ООО «ДС-Инжиниринг» • Федеральный информационный фонд по обеспечению единства измерений (102-ФЗ)',
        department: 'Служба главного метролога',
        filterInfo: searchQuery ? `Поиск: "${searchQuery}"` : parkFilter !== 'all' ? `Парк: ${parkFilter === 'company' ? 'Собственный' : 'Клиентский'}` : 'Все СИ на контроле',
        summaryBadges: [
          { label: 'Всего СИ', value: stats.total, color: 'blue' },
          { label: 'Действуют', value: stats.valid, color: 'green' },
          { label: 'Внимание (<30 дн)', value: stats.warning, color: 'amber' },
          { label: 'Просрочено', value: stats.expired, color: 'red' }
        ],
        headers: ['№', 'Модель СИ / Тип', 'Зав. № / Инв. №', 'Владелец / Организация', 'Срок поверки АРШИН', 'Осталось', 'Состояние'],
        rows: filteredItems.map((item, idx) => [
          String(idx + 1),
          { text: item.modelName, subtext: item.category },
          { text: item.serialNumber, subtext: item.inventoryNumber ? `Инв: ${item.inventoryNumber}` : undefined },
          String(item.ownerName || 'ООО «ДС-Инжиниринг»'),
          { text: item.verificationValidUntil, subtext: item.verificationNumber ? `№ ${item.verificationNumber}` : undefined },
          String(item.status === 'unknown' ? '—' : item.daysLeft > 0 ? `${item.daysLeft} дн.` : `Просрочено на ${Math.abs(item.daysLeft)} дн.`),
          {
            text: item.statusLabel,
            badge: true,
            color: item.status === 'expired' || item.status === 'critical' ? 'rose'
              : item.status === 'warning' ? 'amber'
              : item.status === 'unknown' ? 'slate'
              : 'emerald'
          }
        ]),
        columnAlignments: ['center', 'left', 'left', 'left', 'center', 'center', 'center'],
        columnWidths: ['4%', '22%', '14%', '20%', '16%', '12%', '12%'],
        orientation: 'landscape',
        filename: `Grafik_Poverok_Arshin_DS_Engineering_${new Date().toISOString().slice(0, 10)}.pdf`
      });
      showToast('PDF-отчет графика поверок успешно сформирован');
    } catch (err) {
      console.error('Failed to export Arshin schedule PDF:', err);
      showToast('Ошибка при формировании PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div id="arshin-verification-schedule-container" className="space-y-6">
      {/* Top Breadcrumbs and Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToCrm && (
            <button
              type="button"
              onClick={onBackToCrm}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Вернуться в дашборд CRM"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                ФГИС «АРШИН» / Федеральный информационный фонд по обеспечению единства измерений
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-mono">
                102-ФЗ & ГОСТ Р 8.568
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              График поверки СИ и мониторинг межповерочных интервалов
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Контроль сроков действия свидетельств о поверке координатно-измерительных машин, 3D-сканеров и лазерных трекеров
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setDocModalTab('arshin');
              setIsDocModalOpen(true);
            }}
            className="h-9 px-3.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Открыть регламент работы с графиком поверок и МПИ"
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Справка и Регламент</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="h-9 px-4.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            title="Выгрузить график поверок в формате PDF"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>{isExportingPdf ? 'Создание PDF...' : 'Экспорт PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportScheduleToCsv(filteredItems)}
            className="h-9 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Выгрузить текущий график в формате CSV / Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintPreviewOpen(true)}
            className="h-9 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Открыть официальную печатную форму утвержденного графика поверок"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Печать (Бланк)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Внести прибор на контроль</span>
          </button>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Всего СИ на контроле</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {stats.total} ед.
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.companyCount} собственных / {stats.clientCount} клиентских
          </div>
        </div>

        {/* Expired (Red highlight!) */}
        <button
          type="button"
          onClick={() => setUrgencyFilter('expired_only')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            urgencyFilter === 'expired_only'
              ? 'bg-rose-600 text-white border-rose-600 shadow-lg ring-2 ring-rose-400/50'
              : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 hover:bg-rose-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${urgencyFilter === 'expired_only' ? 'text-rose-100' : 'text-rose-700 dark:text-rose-300'}`}>
              Просрочено!
            </span>
            <AlertTriangle className={`w-4 h-4 animate-bounce ${urgencyFilter === 'expired_only' ? 'text-white' : 'text-rose-600'}`} />
          </div>
          <div className={`text-2xl font-black font-mono mt-1 ${urgencyFilter === 'expired_only' ? 'text-white' : 'text-rose-700 dark:text-rose-400'}`}>
            {stats.expired} СИ
          </div>
          <div className={`text-[11px] mt-1 ${urgencyFilter === 'expired_only' ? 'text-rose-100' : 'text-rose-800 dark:text-rose-300'}`}>
            Запрещена выдача протоколов
          </div>
        </button>

        {/* Critical (Red-Orange highlight!) */}
        <button
          type="button"
          onClick={() => setUrgencyFilter('critical_only')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            urgencyFilter === 'critical_only'
              ? 'bg-red-600 text-white border-red-600 shadow-lg ring-2 ring-red-400/50'
              : 'bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-900 hover:bg-red-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${urgencyFilter === 'critical_only' ? 'text-red-100' : 'text-red-700 dark:text-red-300'}`}>
              Срочно (до 30 дн.)
            </span>
            <Clock className={`w-4 h-4 ${urgencyFilter === 'critical_only' ? 'text-white' : 'text-red-600'}`} />
          </div>
          <div className={`text-2xl font-black font-mono mt-1 ${urgencyFilter === 'critical_only' ? 'text-white' : 'text-red-700 dark:text-red-400'}`}>
            {stats.critical} СИ
          </div>
          <div className={`text-[11px] mt-1 ${urgencyFilter === 'critical_only' ? 'text-red-100' : 'text-red-800 dark:text-red-300'}`}>
            Требуется выезд поверителя
          </div>
        </button>

        {/* Warning */}
        <button
          type="button"
          onClick={() => setUrgencyFilter('warning')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            urgencyFilter === 'warning'
              ? 'bg-amber-500 text-white border-amber-600 shadow-lg'
              : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 hover:bg-amber-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${urgencyFilter === 'warning' ? 'text-amber-100' : 'text-amber-800 dark:text-amber-300'}`}>
              31–60 дней
            </span>
            <Calendar className={`w-4 h-4 ${urgencyFilter === 'warning' ? 'text-white' : 'text-amber-600'}`} />
          </div>
          <div className={`text-2xl font-black font-mono mt-1 ${urgencyFilter === 'warning' ? 'text-white' : 'text-amber-800 dark:text-amber-400'}`}>
            {stats.warning} СИ
          </div>
          <div className={`text-[11px] mt-1 ${urgencyFilter === 'warning' ? 'text-amber-100' : 'text-amber-700 dark:text-amber-400'}`}>
            Плановое согласование
          </div>
        </button>

        {/* Valid */}
        <button
          type="button"
          onClick={() => setUrgencyFilter('valid')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            urgencyFilter === 'valid'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
              : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${urgencyFilter === 'valid' ? 'text-emerald-100' : 'text-emerald-800 dark:text-emerald-300'}`}>
              Действует (&gt; 60 дн.)
            </span>
            <CheckCircle2 className={`w-4 h-4 ${urgencyFilter === 'valid' ? 'text-white' : 'text-emerald-600'}`} />
          </div>
          <div className={`text-2xl font-black font-mono mt-1 ${urgencyFilter === 'valid' ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {stats.valid} СИ
          </div>
          <div className={`text-[11px] mt-1 ${urgencyFilter === 'valid' ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}`}>
            Свидетельства в норме
          </div>
        </button>
      </div>

      {/* Control Bar: Tabs, Park Switcher, Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* View mode toggle (Gantt timeline vs Table) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Диаграмма Ганта (Шкала)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'table'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Табличный реестр</span>
          </button>
        </div>

        {/* Park Type filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex-wrap">
          <button
            type="button"
            onClick={() => setParkFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              parkFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Весь парк ({stats.total})
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
            <span>Собственные ({stats.companyCount})</span>
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
            <span>Клиентские ({stats.clientCount})</span>
          </button>
        </div>

        {/* Search & Reset filter */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[220px] max-w-full">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск прибора, зав. №, АРШИН..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {(urgencyFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setUrgencyFilter('all');
                setSearchQuery('');
              }}
              className="h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              title="Сбросить фильтры"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сброс</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: GANTT TIMELINE SCHEDULE */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850/50">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Календарная шкала окончания свидетельств о поверке (2026–2027 гг.)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Красная разметка указывает на приборы с истекшим или истекающим в течение 30 дней сроком межповерочного интервала
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
                <span className="font-bold text-rose-700">Просрочено / &le; 30 дн.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-amber-800 font-semibold">31–60 дн.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700 font-semibold">&gt; 60 дн.</span>
              </div>
            </div>
          </div>

          {/* Gantt Header with Months */}
          <div className="overflow-x-auto scrollbar-thin">
            <div className="min-w-[860px]">
              {/* Timeline Month Columns Header */}
              <div className="grid grid-cols-12 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/80 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300">
                <div className="col-span-4 p-3 border-r border-slate-200 dark:border-slate-800">
                  Средство измерений (КИМ / Сканер / Трекер)
                </div>
                <div className="col-span-8 grid grid-cols-8 relative">
                  {timelineMonths.map((m) => (
                    <div
                      key={m.key}
                      className={`p-3 text-center border-r border-slate-200 dark:border-slate-700/60 last:border-r-0 ${
                        m.isCurrent ? 'bg-blue-100/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-black' : ''
                      }`}
                    >
                      {m.label}
                      {m.isCurrent && (
                        <div className="text-[9px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-black">
                          (Сегодня)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Нет приборов, удовлетворяющих критериям поиска и фильтрации.
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isCritical = item.status === 'expired' || item.status === 'critical';
                    const markerPercent = getTimelineBarPosition(item.verificationValidUntil);

                    return (
                      <div
                        key={item.id}
                        className={`grid grid-cols-12 items-center text-xs transition-colors ${
                          item.rowHighlightClass || 'hover:bg-slate-50 dark:hover:bg-slate-850/40'
                        }`}
                      >
                        {/* Device Info (Col-4) */}
                        <div className="col-span-4 p-3.5 border-r border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.badgeClass}`}>
                              {item.statusLabel}
                            </span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              item.ownerType === 'company'
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}>
                              {item.ownerName}
                            </span>
                          </div>

                          <div className="font-bold text-slate-900 dark:text-white truncate" title={item.modelName}>
                            {item.modelName}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span>Зав. № {item.serialNumber}</span>
                            <span>•</span>
                            <span className="text-blue-600 dark:text-blue-400 truncate">
                              до {new Date(item.verificationValidUntil).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>

                        {/* Gantt Bar Stage (Col-8) */}
                        <div className="col-span-8 grid grid-cols-8 relative h-16 items-center px-2">
                          {/* Vertical today line marker */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-blue-500/70 z-10 pointer-events-none"
                            style={{ left: `${scheduleWindow.todayPercent.toFixed(2)}%` }} // доля текущего месяца, прошедшая с начала окна
                            title={`Текущая дата: ${scheduleWindow.todayLabel}`}
                          />

                          {/* Background month dividers */}
                          {timelineMonths.map((m, idx) => (
                            <div
                              key={m.key}
                              className={`h-full border-r border-slate-100 dark:border-slate-800/40 last:border-r-0 ${
                                m.isCurrent ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                              }`}
                            />
                          ))}

                          {/* Progress Milestone Marker on Timeline */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center gap-2"
                            style={{ left: `${markerPercent}%` }}
                          >
                            <div 
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer transition-transform hover:scale-125 ${
                                item.status === 'expired'
                                  ? 'bg-rose-600 ring-4 ring-rose-300/50 animate-pulse'
                                  : item.status === 'critical'
                                  ? 'bg-red-500 ring-4 ring-red-200'
                                  : item.status === 'warning'
                                  ? 'bg-amber-500 ring-2 ring-amber-200'
                                  : 'bg-emerald-500'
                              }`}
                              onClick={() => setSelectedItem(item)}
                              title={`Клик для подробностей: ${item.modelName} (Срок: ${item.verificationValidUntil})`}
                            >
                              {item.status === 'expired' ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : item.status === 'critical' ? (
                                <Clock className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </div>

                            {/* Floating quick tag */}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap hidden sm:inline ${
                              isCritical ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
                            }`}>
                              {new Date(item.verificationValidUntil).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DETAILED TABLE REPOSITORY */}
      {activeTab === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin pb-2">
            <table className="w-full data-dense-table text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <th className="px-4 py-3">Статус поверки</th>
                  <th className="px-4 py-3">Модель СИ & Заводской номер</th>
                  <th className="px-4 py-3">Владелец / Организация</th>
                  <th className="px-4 py-3">Свидетельство ФГИС АРШИН</th>
                  <th className="px-4 py-3">Срок действия</th>
                  <th className="px-4 py-3">Ответственный</th>
                  <th className="px-4 py-3 text-right">Оперативные действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      Приборов по заданным фильтрам не найдено.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isCritical = item.status === 'expired' || item.status === 'critical';

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          item.rowHighlightClass || 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                        }`}
                      >
                        {/* Status Badge */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border ${item.badgeClass}`}>
                            {item.status === 'expired' && <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />}
                            {item.status === 'critical' && <Clock className="w-3.5 h-3.5" />}
                            {item.status === 'warning' && <Calendar className="w-3.5 h-3.5" />}
                            {item.status === 'valid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>{item.statusLabel}</span>
                          </span>
                        </td>

                        {/* Model & Serial */}
                        <td className="px-4 py-3 max-w-[240px]">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {item.modelName}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>Зав. № {item.serialNumber}</span>
                            {item.inventoryNumber && (
                              <span className="text-slate-400">({item.inventoryNumber})</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {item.category} • Точность: {item.accuracy || 'высокая'}
                          </div>
                        </td>

                        {/* Owner / Plant */}
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {item.ownerName}
                          </div>
                          {item.ownerInn && (
                            <div className="text-[11px] font-mono text-slate-400">
                              ИНН {item.ownerInn}
                            </div>
                          )}
                          {item.currentLocation && (
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              📍 {item.currentLocation}
                            </div>
                          )}
                        </td>

                        {/* Certificate Number & FGIS Link */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                            {item.verificationNumber}
                          </div>
                          <a
                            href={item.arshinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 font-semibold mt-0.5 underline cursor-pointer"
                            title="Открыть карточку поверки в реестре ФГИС «АРШИН»"
                          >
                            <span>Проверить в АРШИН</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>

                        {/* Valid Until */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className={`font-mono font-bold text-xs ${isCritical ? 'text-rose-600 font-black' : 'text-slate-900 dark:text-white'}`}>
                            до {new Date(item.verificationValidUntil).toLocaleDateString('ru-RU')}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.daysLeft < 0 ? (
                              <span className="text-rose-600 font-bold">Просрочено</span>
                            ) : (
                              <span>Осталось: {item.daysLeft} дн.</span>
                            )}
                          </div>
                        </td>

                        {/* Responsible Person */}
                        <td className="px-4 py-3 max-w-[160px]">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.responsiblePerson}
                          </div>
                          {item.contactPhone && (
                            <div className="text-[11px] font-mono text-slate-500">
                              {item.contactPhone}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Подробная карточка метрологического формуляра"
                            >
                              <Info className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                              title="Редактировать параметры СИ и поверки (Супер-админ / Метролог)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Редактировать</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCreateVerificationDeal(item)}
                              className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isCritical
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-95'
                                  : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white'
                              }`}
                              title="Создать сервисную сделку на поверку в CRM"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Сделка ТО</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmItem(item)}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors cursor-pointer"
                              title="Удалить прибор из графика"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${selectedItem.badgeClass}`}>
                  {selectedItem.statusLabel}
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: {selectedItem.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {selectedItem.modelName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedItem.category} • Производитель: {selectedItem.brand}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Заводской серийный номер:</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedItem.serialNumber}</div>
              </div>
              <div>
                <span className="text-slate-400">Инвентарный номер:</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedItem.inventoryNumber || 'Не присвоен'}</div>
              </div>
              <div>
                <span className="text-slate-400">Владелец / Предприятие:</span>
                <div className="font-bold text-slate-900 dark:text-white">{selectedItem.ownerName}</div>
              </div>
              <div>
                <span className="text-slate-400">Метрологическая точность:</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedItem.accuracy || 'По паспорту СИ'}</div>
              </div>
              <div>
                <span className="text-slate-400">Свидетельство ФГИС «АРШИН»:</span>
                <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedItem.verificationNumber}</div>
              </div>
              <div>
                <span className="text-slate-400">Срок действия поверки:</span>
                <div className={`font-mono font-bold ${selectedItem.status === 'expired' ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                  до {new Date(selectedItem.verificationValidUntil).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">Текущее местонахождение:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedItem.currentLocation || 'Не указано'}</div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">Ответственный метролог / куратор:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedItem.responsiblePerson}</div>
              </div>
            </div>

            {selectedItem.notes && (
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                <b>Метрологические примечания:</b> {selectedItem.notes}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(selectedItem);
                  }}
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Редактировать</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(selectedItem)}
                  className="h-9 px-3 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Удалить прибор"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={selectedItem.arshinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>ФГИС «АРШИН»</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    handleCreateVerificationDeal(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Сделка на ТО</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DEVICE MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-sm max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>Редактирование параметров СИ и поверки</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">
                    Наименование и модель средства измерений *
                  </label>
                  <input
                    type="text"
                    value={editingItem.modelName}
                    onChange={(e) => setEditingItem({ ...editingItem, modelName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                    placeholder="Например: Hexagon Absolute Arm 8530-7"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Производитель / Бренд</label>
                  <input
                    type="text"
                    value={editingItem.brand}
                    onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="Hexagon, Creaform, FARO..."
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Тип / Категория СИ</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Измерительные руки">Измерительные руки (КР)</option>
                    <option value="Координатно-измерительные машины">Стационарные КИМ</option>
                    <option value="Лазерные трекеры">Лазерные трекеры</option>
                    <option value="Оптические 3D-сканеры">Оптические 3D-сканеры</option>
                    <option value="Калибры и эталоны">Эталоны и меры длины</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Заводской серийный номер *</label>
                  <input
                    type="text"
                    value={editingItem.serialNumber}
                    onChange={(e) => setEditingItem({ ...editingItem, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
                    placeholder="SN-8530-8842"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Инвентарный номер</label>
                  <input
                    type="text"
                    value={editingItem.inventoryNumber || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, inventoryNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    placeholder="ИНВ-0082"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Принадлежность парка</label>
                  <select
                    value={editingItem.ownerType}
                    onChange={(e) => {
                      const ot = e.target.value as 'company' | 'client';
                      setEditingItem({
                        ...editingItem,
                        ownerType: ot,
                        ownerName: ot === 'company' ? 'ООО «ДС-Инжиниринг»' : editingItem.ownerName
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="company">Собственный парк («ДС-Инжиниринг»)</option>
                    <option value="client">Парк заказчика (Клиентский)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Владелец / Организация</label>
                  <input
                    type="text"
                    value={editingItem.ownerName}
                    onChange={(e) => setEditingItem({ ...editingItem, ownerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
                    placeholder="ПАО «ОДК-Кузнецов»"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Свидетельство ФГИС «АРШИН»</label>
                  <input
                    type="text"
                    value={editingItem.verificationNumber}
                    onChange={(e) => setEditingItem({ ...editingItem, verificationNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    placeholder="С-МА/12-09-2025/184920"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Срок действия поверки (до) *</label>
                  <input
                    type="date"
                    value={editingItem.verificationValidUntil}
                    onChange={(e) => setEditingItem({ ...editingItem, verificationValidUntil: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Точность измерений (MPE)</label>
                  <input
                    type="text"
                    value={editingItem.accuracy || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, accuracy: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    placeholder="±0.025 мм"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Ответственный специалист</label>
                  <input
                    type="text"
                    value={editingItem.responsiblePerson}
                    onChange={(e) => setEditingItem({ ...editingItem, responsiblePerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="Скобелев А.С."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Местонахождение / Участок</label>
                  <input
                    type="text"
                    value={editingItem.currentLocation || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, currentLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="Самара, Главный метрологический зал КИМ"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Метрологические примечания / ТО</label>
                  <textarea
                    rows={2}
                    value={editingItem.notes || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="Особенности эксплуатации, калибровка оптических головок..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить изменения</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-rose-200 dark:border-rose-900 shadow-sm max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-950/60">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Удаление СИ из графика</h3>
                <p className="text-xs text-slate-500">Действие невозможно будет отменить</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Вы уверены, что хотите удалить средство измерений <strong className="text-slate-900 dark:text-white">{deleteConfirmItem.modelName}</strong> (зав. № <span className="font-mono font-bold">{deleteConfirmItem.serialNumber}</span>) из реестра метрологического графика?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(deleteConfirmItem)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Да, удалить СИ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW DEVICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-sm max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Внесение СИ в реестр метрологического графика</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Принадлежность оборудования:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDevice(prev => ({ ...prev, ownerType: 'company', ownerName: 'ООО «ДС-Инжиниринг»' }))}
                    className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      newDevice.ownerType === 'company'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Собственный эталонный парк
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDevice(prev => ({ ...prev, ownerType: 'client', ownerName: '' }))}
                    className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      newDevice.ownerType === 'client'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Клиентское оборудование
                  </button>
                </div>
              </div>

              {newDevice.ownerType === 'client' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Предприятие-заказчик (Наименование организации):
                  </label>
                  <input
                    type="text"
                    placeholder="Например: АО «Авиаагрегат» или ПАО «КАМАЗ»"
                    value={newDevice.ownerName}
                    onChange={(e) => setNewDevice(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Модель прибора / СИ:
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Hexagon Absolute Arm 8520"
                    value={newDevice.modelName}
                    onChange={(e) => setNewDevice(prev => ({ ...prev, modelName: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Производитель / Бренд:
                  </label>
                  <input
                    type="text"
                    placeholder="Hexagon, Mitutoyo, Leica, Shining 3D"
                    value={newDevice.brand}
                    onChange={(e) => setNewDevice(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Заводской серийный номер:
                  </label>
                  <input
                    type="text"
                    placeholder="HEX-8520-RU-990"
                    value={newDevice.serialNumber}
                    onChange={(e) => setNewDevice(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Инвентарный номер (при наличии):
                  </label>
                  <input
                    type="text"
                    placeholder="ИНВ-042"
                    value={newDevice.inventoryNumber}
                    onChange={(e) => setNewDevice(prev => ({ ...prev, inventoryNumber: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Номер записи во ФГИС «АРШИН»:
                  </label>
                  <input
                    type="text"
                    placeholder="С-СПБ/14-07-2025/08412-АРШИН"
                    value={newDevice.verificationNumber}
                    onChange={(e) => setNewDevice(prev => ({ ...prev, verificationNumber: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Срок действия свидетельства до:
                  </label>
                  <input
                    type="date"
                    value={newDevice.verificationValidUntil}
                    onChange={(e) => setNewDevice(prev => ({ ...prev, verificationValidUntil: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ответственный метролог / инженер:
                </label>
                <input
                  type="text"
                  placeholder="Скобелев А.С. или Ярыш И.В."
                  value={newDevice.responsiblePerson}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, responsiblePerson: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveNewDevice}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Сохранить в график
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-lg shadow-sm max-w-4xl w-full p-8 space-y-6 animate-in fade-in">
            {/* Header controls for printing */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black">Печатная форма: График поверки средств измерений</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Печать / Сохранить в PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official printable document */}
            <div className="space-y-6 text-xs text-slate-900 font-serif">
              {/* Approval stamp */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm">ООО «ДС-Инжиниринг»</div>
                  <div className="text-[11px] text-slate-500">Метрологическая служба & Департамент сервиса КИМ</div>
                  <div className="text-[11px] text-slate-500">ИНН: 6312134567 | ОГРН: 1146312005432</div>
                </div>

                <div className="text-right border border-slate-300 p-3 rounded-lg text-[11px]">
                  <div className="font-bold uppercase tracking-wider">УТВЕРЖДАЮ</div>
                  <div>Генеральный директор ООО «ДС-Инжиниринг»</div>
                  <div className="mt-2 font-bold font-sans">________________ / Некрасов С.Ю. /</div>
                  <div className="text-[10px] text-slate-400">«15» сентября 2026 г.</div>
                </div>
              </div>

              <div className="text-center py-2 border-y border-slate-300">
                <h2 className="text-base font-black font-sans uppercase tracking-wide">
                  ПЛАН-ГРАФИК ПОВЕРКИ И ТЕХНИЧЕСКОГО ОБСЛУЖИВАНИЯ СРЕДСТВ ИЗМЕРЕНИЙ
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  с регистрацией результатов во ФГИС «АРШИН» (Федеральный закон № 102-ФЗ «Об обеспечении единства измерений») на период 2026–2027 гг.
                </p>
              </div>

              {/* Printable Table */}
              <table className="w-full data-dense-table border-collapse border border-slate-400 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 font-bold uppercase">
                    <th className="border border-slate-300 p-1.5 text-center w-8">№</th>
                    <th className="border border-slate-300 p-1.5">Наименование СИ, тип и марка</th>
                    <th className="border border-slate-300 p-1.5">Заводской №</th>
                    <th className="border border-slate-300 p-1.5">Владелец (Предприятие)</th>
                    <th className="border border-slate-300 p-1.5">Свидетельство ФГИС АРШИН</th>
                    <th className="border border-slate-300 p-1.5 text-center">Срок поверки</th>
                    <th className="border border-slate-300 p-1.5">Статус / План</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => (
                    <tr key={item.id} className={item.status === 'expired' ? 'bg-rose-50' : ''}>
                      <td className="border border-slate-300 p-1.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-1.5 font-bold font-sans">{item.modelName}</td>
                      <td className="border border-slate-300 p-1.5 font-mono">{item.serialNumber}</td>
                      <td className="border border-slate-300 p-1.5">{item.ownerName}</td>
                      <td className="border border-slate-300 p-1.5 font-mono">{item.verificationNumber}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">
                        {new Date(item.verificationValidUntil).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="border border-slate-300 p-1.5 font-sans font-semibold">
                        {item.status === 'expired' ? 'ПРОСРОЧЕНО (Срочная поверка)' : item.status === 'critical' ? 'Срочный вызов поверителя' : 'В плановом графике'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-4 flex justify-between items-center text-[11px]">
                <div>Главный метролог / Ответственный специалист: ________________ / Скобелев А.С. /</div>
                <div>М.П.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRM Interactive Documentation Modal */}
      <CrmDocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        initialTab={docModalTab}
      />
    </div>
  );
};
