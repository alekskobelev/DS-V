import React, { useState, useRef } from 'react';
import { 
  Search, Plus, Download, Upload, Wrench, Shield, Calendar, 
  MapPin, User, AlertTriangle, CheckCircle2, Clock, 
  Edit3, Trash2, ExternalLink, Filter, FileCheck, 
  ArrowUpRight, Eye, RefreshCw, Sparkles, Building2, Tag, Hash,
  LayoutGrid, Table as TableIcon, List as ListIcon, FileSpreadsheet, FileText, Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyFleetDevice, FleetDeviceStatus } from '../../types';
import { FleetDeviceModal } from './FleetDeviceModal';
import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';
import { exportTableToPdf } from '../../utils/exportTablePdf';

export const CompanyFleetRegistry: React.FC = () => {
  const { fleetDevices, updateFleetDevice, deleteFleetDevice, addFleetDevice, showToast, setCurrentPage } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FleetDeviceStatus | 'expiring' | 'expired'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list'>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<CompanyFleetDevice | null>(null);

  // Verification calculations
  const now = new Date();

  const getVerificationState = (validUntilStr?: string) => {
    if (!validUntilStr) return { status: 'unknown', label: 'Не указана', color: 'gray', days: 0 };
    const validUntil = new Date(validUntilStr);
    const diffMs = validUntil.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { 
        status: 'expired', 
        label: `Просрочена на ${Math.abs(days)} дн.`, 
        badgeClass: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertTriangle,
        days 
      };
    }
    if (days <= 30) {
      return { 
        status: 'expiring', 
        label: `Истекает через ${days} дн.`, 
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: Clock,
        days 
      };
    }
    return { 
      status: 'valid', 
      label: `Действует (осталось ${days} дн.)`, 
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      days 
    };
  };

  const getStatusBadge = (status: FleetDeviceStatus) => {
    switch (status) {
      case 'in_office':
        return { label: 'В офисе / Метрологическом зале', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 'on_site':
        return { label: 'На выезде у заказчика', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
      case 'in_verification':
        return { label: 'На поверке / калибровке', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case 'maintenance':
        return { label: 'На сервисном ТО', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' };
      default:
        return { label: status, bg: 'bg-gray-50 text-slate-500 border-gray-200', dot: 'bg-gray-400' };
    }
  };

  // Filtered devices
  const filteredDevices = fleetDevices.filter(dev => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      dev.modelName.toLowerCase().includes(q) ||
      dev.serialNumber.toLowerCase().includes(q) ||
      dev.inventoryNumber.toLowerCase().includes(q) ||
      (dev.brand && dev.brand.toLowerCase().includes(q)) ||
      (dev.verificationNumber && dev.verificationNumber.toLowerCase().includes(q)) ||
      (dev.currentLocation && dev.currentLocation.toLowerCase().includes(q)) ||
      (dev.responsiblePerson && dev.responsiblePerson.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    const verState = getVerificationState(dev.verificationValidUntil);
    if (statusFilter === 'all') return true;
    if (statusFilter === 'expiring') return verState.status === 'expiring';
    if (statusFilter === 'expired') return verState.status === 'expired';
    return dev.status === statusFilter;
  });

  // KPI Counters
  const totalCount = fleetDevices.length;
  const inOfficeCount = fleetDevices.filter(d => d.status === 'in_office').length;
  const onSiteCount = fleetDevices.filter(d => d.status === 'on_site').length;
  const inVerificationCount = fleetDevices.filter(d => d.status === 'in_verification').length;
  const expiredCount = fleetDevices.filter(d => getVerificationState(d.verificationValidUntil).status === 'expired').length;
  const expiringCount = fleetDevices.filter(d => getVerificationState(d.verificationValidUntil).status === 'expiring').length;

  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dev: CompanyFleetDevice) => {
    setEditingDevice(dev);
    setIsModalOpen(true);
  };

  const handleDelete = async (dev: CompanyFleetDevice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Вы уверены, что хотите удалить прибор «${dev.modelName}» (№ ${dev.serialNumber}) из парка?`)) {
      await deleteFleetDevice(dev.id);
      showToast(`Прибор ${dev.modelName} удален`);
    }
  };

  const handleQuickStatusChange = async (dev: CompanyFleetDevice, newStatus: FleetDeviceStatus, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    await updateFleetDevice(dev.id, { status: newStatus });
    showToast(`Статус прибора ${dev.serialNumber} изменен на: ${getStatusBadge(newStatus).label}`);
  };

  // Excel Import
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const XLSX = await import('xlsx');
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        let importedCount = 0;
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const newDevice: CompanyFleetDevice = {
            id: `dev-imported-${Date.now()}-${i}`,
            modelName: row['Модель прибора'] || row['Модель'] || `Оборудование ${i + 1}`,
            brand: row['Производитель'] || row['Бренд'] || 'Hexagon',
            category: row['Категория'] || 'Координатно-измерительные руки',
            serialNumber: row['Заводской серийный №'] || row['Серийный №'] || `SN-${Date.now()}-${i}`,
            inventoryNumber: row['Инвентарный №'] || `ИНВ-${Math.floor(100 + Math.random() * 900)}`,
            status: (row['Статус нахождения']?.toLowerCase().includes('выезд') ? 'on_site' :
                    row['Статус нахождения']?.toLowerCase().includes('поверк') ? 'in_verification' :
                    row['Статус нахождения']?.toLowerCase().includes('то') ? 'maintenance' : 'in_office') as FleetDeviceStatus,
            verificationNumber: row['Свидетельство о поверке'] || row['Поверка'] || '',
            verificationDate: row['Дата поверки'] || '',
            verificationValidUntil: row['Срок поверки (Действует до)'] || row['Срок поверки'] || '2026-12-31',
            currentLocation: row['Местонахождение / Объект'] || row['Местонахождение'] || 'Главный офис (Самара) / Метрологический зал (Тольятти)',
            responsiblePerson: row['Ответственный'] || 'Ярыш И.В.',
            accuracy: row['Точность'] || '±0.025 мм',
            measuringRange: row['Диапазон'] || '2.5 м',
            notes: row['Комплектация/Примечания'] || row['Примечания'] || '',
            photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
          };
          await addFleetDevice(newDevice);
          importedCount++;
        }

        if (importedCount > 0) {
          showToast(`Успешно импортировано ${importedCount} приборов в парк оборудования`);
        } else {
          showToast('Не найдено корректных строк для импорта в файле');
        }
      } catch (err) {
        console.error(err);
        showToast('Ошибка при чтении Excel файла');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // Excel Export
  const exportToExcel = async () => {
    try {
      const dataToExport = filteredDevices.map(dev => ({
        'Модель прибора': dev.modelName,
        'Производитель': dev.brand,
        'Категория': dev.category || '',
        'Заводской серийный №': dev.serialNumber,
        'Инвентарный №': dev.inventoryNumber,
        'Статус нахождения': getStatusBadge(dev.status).label,
        'Свидетельство о поверке': dev.verificationNumber,
        'Дата поверки': dev.verificationDate || '',
        'Срок поверки (Действует до)': dev.verificationValidUntil,
        'Статус поверки': getVerificationState(dev.verificationValidUntil).label,
        'Местонахождение / Объект': dev.currentLocation || '',
        'Ответственный': dev.responsiblePerson || '',
        'Точность': dev.accuracy || '',
        'Диапазон': dev.measuringRange || '',
        'Комплектация/Примечания': dev.notes || ''
      }));

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Парк приборов');
      
      const colWidths = [
        { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 15 },
        { wch: 24 }, { wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 25 },
        { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 35 }
      ];
      ws['!cols'] = colWidths;

      const fileName = `Парк_Оборудования_ДС-Инжиниринг_${new Date().toLocaleDateString('ru-RU')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast('Реестр парка приборов успешно выгружен в Excel');
    } catch (e) {
      console.error(e);
      showToast('Ошибка при экспорте в Excel');
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // PDF Export
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportTableToPdf({
        title: 'Реестр приборного парка и метрологического контроля СИ',
        subtitle: 'ООО «ДС-Инжиниринг» • Лаборатория КИМ и оптических сканирующих систем',
        department: 'Служба главного метролога и сервисного обслуживания',
        filterInfo: searchQuery ? `Поиск: "${searchQuery}"` : statusFilter !== 'all' ? `Фильтр: ${statusFilter}` : 'Все средства измерений парка',
        summaryBadges: [
          { label: 'Всего приборов', value: totalCount, color: 'blue' },
          { label: 'В офисе/зале', value: inOfficeCount, color: 'green' },
          { label: 'На выезде', value: onSiteCount, color: 'blue' },
          { label: 'На поверке', value: inVerificationCount, color: 'amber' },
          { label: 'Просрочено', value: expiredCount, color: 'red' }
        ],
        headers: ['№', 'Модель СИ / Прибор', 'Зав. № / Инв. №', 'Категория', 'Статус нахождения', 'Срок поверки АРШИН', 'Ответственный'],
        rows: filteredDevices.map((dev, idx) => {
          const verState = getVerificationState(dev.verificationValidUntil);
          return [
            String(idx + 1),
            { text: dev.modelName, subtext: dev.brand ? `Бренд: ${dev.brand}` : undefined },
            { text: dev.serialNumber || '—', subtext: dev.inventoryNumber ? `Инв: ${dev.inventoryNumber}` : undefined },
            String(dev.category || 'КИМ / Сканер'),
            {
              text: dev.status === 'in_office' ? 'В офисе' : dev.status === 'on_site' ? 'На выезде' : dev.status === 'in_verification' ? 'На поверке' : 'Обслуживание',
              badge: true,
              color: dev.status === 'in_office' ? 'emerald' : dev.status === 'on_site' ? 'blue' : dev.status === 'in_verification' ? 'amber' : 'slate'
            },
            {
              text: dev.verificationValidUntil || 'Не указан',
              badge: true,
              color: verState.status === 'expired' ? 'rose' : verState.status === 'expiring' ? 'amber' : 'emerald',
              subtext: dev.verificationNumber ? `Свид. № ${dev.verificationNumber}` : undefined
            },
            String(dev.responsiblePerson || 'Некрасов С.Ю.')
          ];
        }),
        columnAlignments: ['center', 'left', 'left', 'left', 'center', 'center', 'left'],
        columnWidths: ['4%', '23%', '14%', '15%', '13%', '16%', '15%'],
        orientation: 'landscape',
        filename: `Park_Priborov_DS_Engineering_${new Date().toISOString().slice(0, 10)}.pdf`
      });
      showToast('PDF-отчет по парку оборудования успешно сформирован');
    } catch (e) {
      console.error('PDF export error:', e);
      showToast('Ошибка при экспорте в PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for Excel import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportExcel}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Header & Stats Cards */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">
                <span>Внутренний реестр активов</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Приборный парк компании
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Контроль заводских серийных номеров, статусов нахождения и сроков поверок ФГИС «АРШИН»
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Импорт из Excel"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Импорт</span>
            </button>
            <button
              type="button"
              id="export-fleet-pdf-btn"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              title="Экспорт в PDF отчет"
            >
              {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <FileText className="w-4 h-4 text-rose-600" />}
              <span className="hidden sm:inline">{isExportingPdf ? 'Создание PDF...' : 'Экспорт PDF'}</span>
            </button>
            <button
              type="button"
              id="export-fleet-excel-btn"
              onClick={exportToExcel}
              className="px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Экспорт в Excel"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              type="button"
              id="add-fleet-device-btn"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить оборудование</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === 'all' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-gray-200/80 hover:border-gray-300'
          }`}
        >
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Всего в парке</div>
          <div className="text-2xl font-black text-gray-900 mt-1 flex items-baseline gap-2">
            {totalCount}
            <span className="text-xs font-medium text-gray-400">приборов</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('in_office')}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === 'in_office' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-gray-200/80 hover:border-gray-300'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>В офисе / Зале</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1 flex items-baseline gap-2">
            {inOfficeCount}
            <span className="text-xs font-medium text-emerald-600">готовы</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('on_site')}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === 'on_site' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-gray-200/80 hover:border-gray-300'
          }`}
        >
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>На выезде</span>
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1 flex items-baseline gap-2">
            {onSiteCount}
            <span className="text-xs font-medium text-blue-600">на объектах</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('in_verification')}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === 'in_verification' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-gray-200/80 hover:border-gray-300'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>На поверке</span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1 flex items-baseline gap-2">
            {inVerificationCount}
            <span className="text-xs font-medium text-amber-600">в ЦСМ</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(expiredCount > 0 ? 'expired' : 'expiring')}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === 'expired' || statusFilter === 'expiring' 
              ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20' 
              : 'bg-white border-gray-200/80 hover:border-gray-300'
          }`}
        >
          <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>Внимание поверка</span>
          </div>
          <div className="text-2xl font-black text-red-600 mt-1 flex items-baseline gap-2">
            {expiredCount + expiringCount}
            <span className="text-xs font-medium text-red-500">
              ({expiredCount} проср. / {expiringCount} ист.)
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banner for expired verifications */}
      {expiredCount > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-900">
            <div className="font-bold text-sm">
              Внимание: {expiredCount} прибор(а) с истекшим сроком поверки ФГИС «АРШИН»!
            </div>
            <p className="mt-0.5 text-red-800">
              Использование непроверенного оборудования в метрологических отчетах и при контроле ответственных деталей не допускается. Запланируйте передачу в метрологический центр.
            </p>
          </div>
        </div>
      )}

      {/* Filter & Search & ViewMode Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200/80 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="fleet-search-input"
            placeholder="Поиск по модели, серийнику, инв. №, поверке..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Middle: Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Все ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_office')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'in_office' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            В офисе / Зале ({inOfficeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('on_site')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'on_site' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            На выезде ({onSiteCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_verification')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'in_verification' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            На поверке ({inVerificationCount})
          </button>
          {(expiredCount > 0 || expiringCount > 0) && (
            <button
              type="button"
              onClick={() => setStatusFilter('expired')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'expired' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Просрочена ({expiredCount})
            </button>
          )}
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-gray-200 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            id="fleet-view-cards"
            onClick={() => setViewMode('cards')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-gray-900'
            }`}
            title="Отображение: Карточки"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Карточки</span>
          </button>
          <button
            type="button"
            id="fleet-view-table"
            onClick={() => setViewMode('table')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-gray-900'
            }`}
            title="Отображение: Таблица"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Таблица</span>
          </button>
          <button
            type="button"
            id="fleet-view-list"
            onClick={() => setViewMode('list')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-gray-900'
            }`}
            title="Отображение: Список"
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Список</span>
          </button>
        </div>
      </div>

      {/* Fleet Device Content */}
      {filteredDevices.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">Приборы не найдены</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            {searchQuery ? 'Попробуйте изменить поисковый запрос или сбросить фильтры' : 'В приборном парке пока нет записей. Добавьте первый прибор!'}
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить оборудование</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDevices.map(dev => {
            const ver = getVerificationState(dev.verificationValidUntil);
            const statusInfo = getStatusBadge(dev.status);
            const VerIcon = ver.icon || Shield;

            return (
              <div 
                key={dev.id}
                className="bg-white rounded-lg border border-gray-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card top banner & Photo */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden border-b border-gray-100">
                    <img 
                      src={dev.photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'} 
                      alt={dev.modelName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Status badge top right */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-md ${statusInfo.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Brand & Category top left */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {dev.brand}
                      </span>
                    </div>

                    {/* Bottom overlay in image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[11px] text-blue-200 font-mono flex items-center gap-2">
                        <span className="font-bold">№ {dev.serialNumber}</span>
                        {dev.inventoryNumber && (
                          <span className="text-white/70">({dev.inventoryNumber})</span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white leading-snug drop-shadow-sm truncate">
                        {dev.modelName}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 text-xs">
                    
                    {/* Verification Box */}
                    <div className={`p-3 rounded-lg border flex items-start justify-between gap-2 ${ver.badgeClass}`}>
                      <div className="space-y-0.5">
                        <div className="font-bold text-[11px] flex items-center gap-1.5">
                          <VerIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Поверка (ФГИС «АРШИН»)</span>
                        </div>
                        <div className="font-mono text-[11px] font-bold">
                          {dev.verificationNumber || 'Номер не указан'}
                        </div>
                        <div className="text-[10px] opacity-80">
                          Срок: до {dev.verificationValidUntil ? new Date(dev.verificationValidUntil).toLocaleDateString('ru-RU') : 'бессрочно'} ({ver.label})
                        </div>
                      </div>

                      {dev.verificationDocUrl && (
                        <a
                          href={dev.verificationDocUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-white/80 hover:bg-white rounded-lg text-slate-500 shadow-sm transition-colors flex-shrink-0 cursor-pointer"
                          title="Открыть скан свидетельства о поверке"
                        >
                          <FileCheck className="w-4 h-4 text-blue-600" />
                        </a>
                      )}
                    </div>

                    {/* Location & Responsible */}
                    <div className="grid grid-cols-1 gap-1.5 text-slate-500 text-[11px]">
                      {dev.currentLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{dev.currentLocation}</span>
                        </div>
                      )}
                      {dev.responsiblePerson && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{dev.responsiblePerson}</span>
                        </div>
                      )}
                      {(dev.accuracy || dev.measuringRange) && (
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1 border-t border-gray-100 font-mono">
                          {dev.accuracy && <span>Точность: <b>{dev.accuracy}</b></span>}
                          {dev.measuringRange && <span>Диапазон: <b>{dev.measuringRange}</b></span>}
                        </div>
                      )}
                    </div>

                    {/* Notes if any */}
                    {dev.notes && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-gray-100">
                        {dev.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-4 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Quick status dropdown */}
                  <div className="relative">
                    <select
                      value={dev.status}
                      onChange={(e) => handleQuickStatusChange(dev, e.target.value as FleetDeviceStatus, e)}
                      className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-slate-500 hover:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none pr-6"
                    >
                      <option value="in_office">🟢 В офисе / Зале</option>
                      <option value="on_site">🔵 На выезде</option>
                      <option value="in_verification">🟡 На поверке</option>
                      <option value="maintenance">🟣 На ТО</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(dev)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Редактировать данные прибора"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(dev, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Удалить из парка"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <HorizontalScrollContainer>
            <table className="w-full data-dense-table text-left text-xs whitespace-nowrap border-collapse min-w-[1000px]">
              <thead className="bg-slate-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Оборудование</th>
                  <th className="px-4 py-3">Серийный / Инв. №</th>
                  <th className="px-4 py-3">Статус нахождения</th>
                  <th className="px-4 py-3">Поверка ФГИС «АРШИН»</th>
                  <th className="px-4 py-3">Местонахождение</th>
                  <th className="px-4 py-3">Ответственный</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDevices.map(dev => {
                  const ver = getVerificationState(dev.verificationValidUntil);
                  const statusInfo = getStatusBadge(dev.status);
                  const VerIcon = ver.icon || Shield;

                  return (
                    <tr 
                      key={dev.id}
                      onClick={() => handleOpenEditModal(dev)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={dev.photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'} 
                            alt={dev.modelName} 
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" 
                          />
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{dev.modelName}</div>
                            <div className="text-[11px] text-gray-500 font-medium">{dev.brand} {dev.category ? `• ${dev.category}` : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-gray-900">{dev.serialNumber}</div>
                        {dev.inventoryNumber && (
                          <div className="text-[11px] text-gray-500 font-mono">{dev.inventoryNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <select
                          value={dev.status}
                          onChange={(e) => handleQuickStatusChange(dev, e.target.value as FleetDeviceStatus, e)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${statusInfo.bg}`}
                        >
                          <option value="in_office">🟢 В офисе / Зале</option>
                          <option value="on_site">🔵 На выезде</option>
                          <option value="in_verification">🟡 На поверке</option>
                          <option value="maintenance">🟣 На ТО</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="font-mono text-[11px] font-semibold text-gray-800 flex items-center gap-1">
                            <VerIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>{dev.verificationNumber || 'Не указан'}</span>
                          </div>
                          <div className="text-[11px]">
                            <span className={`inline-block px-1.5 py-0.5 rounded font-bold text-[10px] border ${ver.badgeClass}`}>
                              {ver.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-500 max-w-[180px] truncate" title={dev.currentLocation}>
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{dev.currentLocation || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{dev.responsiblePerson || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(dev)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Редактировать"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(dev, e)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </HorizontalScrollContainer>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-2.5">
          {filteredDevices.map(dev => {
            const ver = getVerificationState(dev.verificationValidUntil);
            const statusInfo = getStatusBadge(dev.status);
            const VerIcon = ver.icon || Shield;

            return (
              <div
                key={dev.id}
                onClick={() => handleOpenEditModal(dev)}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={dev.photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'}
                    alt={dev.modelName}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                        {dev.modelName}
                      </h4>
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {dev.brand}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">Зав. № {dev.serialNumber}</span>
                      {dev.inventoryNumber && <span>({dev.inventoryNumber})</span>}
                      {dev.accuracy && <span className="text-gray-400">• Точность {dev.accuracy}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-3 self-stretch md:self-auto justify-between md:justify-end">
                  {/* Verification pill */}
                  <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${ver.badgeClass}`}>
                    <VerIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{ver.label}</span>
                  </div>

                  {/* Status quick select */}
                  <div onClick={e => e.stopPropagation()}>
                    <select
                      value={dev.status}
                      onChange={(e) => handleQuickStatusChange(dev, e.target.value as FleetDeviceStatus, e)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${statusInfo.bg}`}
                    >
                      <option value="in_office">🟢 В офисе / Зале</option>
                      <option value="on_site">🔵 На выезде</option>
                      <option value="in_verification">🟡 На поверке</option>
                      <option value="maintenance">🟣 На ТО</option>
                    </select>
                  </div>

                  {/* Location & Person */}
                  <div className="hidden xl:flex flex-col text-right text-[11px] text-gray-500">
                    <span className="font-medium text-gray-800">{dev.responsiblePerson || 'Без ответственного'}</span>
                    <span className="truncate max-w-[140px]">{dev.currentLocation || 'СПб'}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(dev)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Редактировать"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(dev, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit */}
      <FleetDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deviceToEdit={editingDevice}
      />
    </div>
  );
};
