import React, { useState, useRef } from 'react';
import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';

import { 
  Search, Plus, FileText, Download, Upload,
  Trash2, X, ClipboardCheck, Calendar, User, Building2,
  Edit3, Paperclip, Eye, UploadCloud,
  Shield, AlertTriangle, CheckCircle2, Clock, Wrench, Hash,
  LayoutGrid, Table as TableIcon, List as ListIcon, Check,
  ChevronDown, ExternalLink, Sparkles, Filter,
  Maximize2, Minimize2, Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetrologyReport, AttachedDocument, CrmCompany, CrmContact, CompanyFleetDevice } from '../../types';
import { AccountFileModal } from '../account/AccountFileModal';
import { AccountDocViewerModal } from '../account/AccountDocViewerModal';
import { apiService } from '../../services/apiService';
import { CompanyModal } from './CompanyModal';
import { ContactModal } from './ContactModal';
import { exportTableToPdf } from '../../utils/exportTablePdf';
import { useModalStack } from '../../hooks/useModalStack';

import { getUserPermissions } from '../../types';

export const MetrologyReportsRegistry: React.FC = () => {
  const { metrologyReports, setMetrologyReports, fleetDevices, showToast, authUsers, currentUser } = useApp();
  
  const userPerms = React.useMemo(() => getUserPermissions(currentUser), [currentUser]);
  const hasCrmAccess = currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || !!userPerms?.canAccessCrm;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list'>('list');
  
  // Modals state
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<MetrologyReport | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEquipmentPickerOpen, setIsEquipmentPickerOpen] = useState(false);
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');

  const certModal = useModalStack({
    id: 'metrology-report-editor-modal',
    isOpen: isCertModalOpen && !!editingCert,
    onClose: () => setIsCertModalOpen(false),
    baseZIndex: 400
  });

  const equipmentPickerModal = useModalStack({
    id: 'metrology-equipment-picker-modal',
    isOpen: isEquipmentPickerOpen,
    onClose: () => setIsEquipmentPickerOpen(false),
    baseZIndex: 520
  });
  
  // File attachments state
  const [attachTarget, setAttachTarget] = useState<MetrologyReport | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{doc: AttachedDocument, cert: MetrologyReport} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // CRM Integration State
  const [crmCompanies, setCrmCompanies] = useState<CrmCompany[]>([]);
  const [crmContacts, setCrmContacts] = useState<CrmContact[]>([]);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [isContModalOpen, setIsContModalOpen] = useState(false);

  React.useEffect(() => {
    const fetchCrmData = async () => {
      const compRes = await apiService.getCrmCompanies();
      if (compRes.success) setCrmCompanies(compRes.data);
      const contRes = await apiService.getCrmContacts();
      if (contRes.success) setCrmContacts(contRes.data);
    };
    fetchCrmData();
  }, []);

  const getDeviceVerificationInfo = (validUntilStr?: string) => {
    if (!validUntilStr) return { isExpired: false, isExpiringSoon: false, text: 'Поверка не указана', color: 'gray' };
    const validUntil = new Date(validUntilStr);
    const now = new Date();
    const diffMs = validUntil.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        isExpired: true,
        isExpiringSoon: false,
        daysLeft,
        text: `Поверка просрочена на ${Math.abs(daysLeft)} дн.`,
        color: 'red'
      };
    }
    if (daysLeft <= 30) {
      return {
        isExpired: false,
        isExpiringSoon: true,
        daysLeft,
        text: `Истекает через ${daysLeft} дн.`,
        color: 'amber'
      };
    }
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysLeft,
      text: `Действует (до ${validUntil.toLocaleDateString('ru-RU')})`,
      color: 'emerald'
    };
  };

  const filteredCerts = metrologyReports.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.reportNumber || '').toLowerCase().includes(q) ||
      (c.objectName || '').toLowerCase().includes(q) ||
      (c.customer || '').toLowerCase().includes(q) ||
      (c.engineer || '').toLowerCase().includes(q) ||
      (c.equipment && c.equipment.toLowerCase().includes(q)) ||
      (c.equipmentSerial && c.equipmentSerial.toLowerCase().includes(q)) ||
      (c.verificationCertificate && c.verificationCertificate.toLowerCase().includes(q))
    );
  });

  const handleOpenAddModal = () => {
    const defaultDevice = fleetDevices.find(d => d.status === 'in_office') || fleetDevices[0];
    const verInfo = defaultDevice ? getDeviceVerificationInfo(defaultDevice.verificationValidUntil) : null;
    const defaultEng = authUsers.find(u => u.role !== 'client')?.fullName || 'Ярыш И.В.';

    setEditingCert({
      id: `cert-${Date.now()}`,
      reportNumber: `ОМК-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('ru-RU'),
      objectName: '',
      customer: crmCompanies[0]?.name || 'ПАО «ОДК-Кузнецов»',
      engineer: defaultEng,
      fleetDeviceId: defaultDevice?.id,
      equipment: defaultDevice?.modelName || 'Hexagon Absolute Arm 8525-7',
      equipmentSerial: defaultDevice?.serialNumber || '8525-4491-RU',
      inventoryNumber: defaultDevice?.inventoryNumber || 'ИНВ-ДС-042',
      verificationCertificate: defaultDevice?.verificationNumber || 'С-СПБ/24-08-2025/119044-АРШИН',
      verificationValidUntil: defaultDevice?.verificationValidUntil || '2026-11-20',
      isVerificationExpired: verInfo?.isExpired || false,
      files: []
    } as MetrologyReport);
    setIsEquipmentPickerOpen(false);
    setIsCertModalOpen(true);
  };

  const handleOpenEditModal = (cert: MetrologyReport) => {
    if (!hasCrmAccess) return;
    setEditingCert({ ...cert });
    setIsEquipmentPickerOpen(false);
    setIsCertModalOpen(true);
  };

  const handleSelectFleetDevice = (devId: string) => {
    if (!editingCert) return;
    if (devId === 'custom') {
      setEditingCert({
        ...editingCert,
        fleetDeviceId: undefined,
        equipment: '',
        equipmentSerial: '',
        inventoryNumber: '',
        verificationCertificate: '',
        verificationValidUntil: '',
        isVerificationExpired: false
      });
      setIsEquipmentPickerOpen(false);
      return;
    }

    const device = fleetDevices.find(d => d.id === devId);
    if (device) {
      const verInfo = getDeviceVerificationInfo(device.verificationValidUntil);
      setEditingCert({
        ...editingCert,
        fleetDeviceId: device.id,
        equipment: device.modelName,
        equipmentSerial: device.serialNumber,
        inventoryNumber: device.inventoryNumber,
        verificationCertificate: device.verificationNumber,
        verificationValidUntil: device.verificationValidUntil,
        isVerificationExpired: verInfo.isExpired
      });
      setIsEquipmentPickerOpen(false);
    }
  };

  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert || !editingCert.reportNumber || !editingCert.objectName) return;
    
    // Check verification expiration flag before saving
    const verInfo = getDeviceVerificationInfo(editingCert.verificationValidUntil);
    const finalCert = {
      ...editingCert,
      isVerificationExpired: verInfo.isExpired
    };

    const exists = metrologyReports.some(c => c.id === finalCert.id);
    if (exists) {
      setMetrologyReports(metrologyReports.map(c => c.id === finalCert.id ? finalCert : c));
      apiService.updateCrmMetrologyReport(finalCert.id, finalCert);
      showToast('Метрологический отчет успешно обновлен');
    } else {
      setMetrologyReports([finalCert, ...metrologyReports]);
      apiService.saveCrmMetrologyReport(finalCert);
      showToast('Новый отчет успешно создан');
    }
    setIsCertModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить этот отчет?')) {
      setMetrologyReports(metrologyReports.filter(c => c.id !== id));
      apiService.deleteCrmMetrologyReport(id);
      showToast('Метрологический отчет удален');
    }
  };

  const handleCloneReport = (cert: MetrologyReport, e: React.MouseEvent) => {
    e.stopPropagation();
    const clonedNum = `${cert.reportNumber}-КОПИЯ`;
    const cloned: MetrologyReport = {
      ...cert,
      id: `cert-clone-${Date.now()}`,
      reportNumber: clonedNum,
      date: new Date().toLocaleDateString('ru-RU')
    };
    setMetrologyReports([cloned, ...metrologyReports]);
    apiService.saveCrmMetrologyReport(cloned);
    showToast(`Создана копия отчета «${clonedNum}»`);
  };

  // Excel Export
  const exportToExcel = async () => {
    try {
      const dataToExport = filteredCerts.map(cert => ({
        'Номер отчета': cert.reportNumber,
        'Дата выдачи': cert.date,
        'Контактное лицо': cert.objectName,
        'Применяемое оборудование': cert.equipment || '',
        'Заводской серийный №': cert.equipmentSerial || '',
        'Инвентарный №': cert.inventoryNumber || '',
        'Свидетельство о поверке': cert.verificationCertificate || '',
        'Срок действия поверки': cert.verificationValidUntil || '',
        'Статус поверки': cert.isVerificationExpired ? 'ПРОСРОЧЕНА' : 'Действует',
        'Заказчик': cert.customer,
        'Метролог': cert.engineer,
        'Кол-во файлов': cert.files?.length || 0
      }));

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Метрологические отчеты');
      XLSX.writeFile(workbook, `Реестр_метрологических_отчетов_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('Реестр отчетов успешно экспортирован в Excel');
    } catch (error) {
      console.error('Ошибка экспорта Excel:', error);
      showToast('Ошибка при экспорте в Excel');
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // PDF Export
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportTableToPdf({
        title: 'Реестр метрологических отчетов и протоколов измерений',
        subtitle: 'ООО «ДС-Инжиниринг» • Лаборатория КИМ и 3D-контроля геометрии',
        department: 'Служба главного метролога и отдел контроля качества',
        filterInfo: searchQuery ? `Поиск: "${searchQuery}"` : 'Все зарегистрированные метрологические отчеты',
        summaryBadges: [
          { label: 'Всего отчетов', value: filteredCerts.length, color: 'blue' },
          { label: 'Со сканами/PDF', value: filteredCerts.filter(c => (c.files?.length || 0) > 0).length, color: 'green' }
        ],
        headers: ['№', 'Номер отчета', 'Дата выдачи', 'Контакт / Заказчик', 'Применяемое оборудование', 'Срок поверки СИ', 'Метролог'],
        rows: filteredCerts.map((cert, idx) => {
          const verInfo = getDeviceVerificationInfo(cert.verificationValidUntil);
          return [
            String(idx + 1),
            String(cert.reportNumber || '—'),
            String(cert.date || '—'),
            { text: cert.customer, subtext: cert.objectName ? `Контакт: ${cert.objectName}` : undefined },
            { text: cert.equipment || '—', subtext: cert.equipmentSerial ? `Зав. № ${cert.equipmentSerial}` : undefined },
            {
              text: cert.verificationValidUntil || 'Не указан',
              badge: true,
              color: verInfo.isExpired ? 'rose' : verInfo.isExpiringSoon ? 'amber' : 'emerald',
              subtext: cert.verificationCertificate ? `Свид: ${cert.verificationCertificate}` : undefined
            },
            String(cert.engineer || 'Ярыш И.В.')
          ];
        }),
        columnAlignments: ['center', 'center', 'center', 'left', 'left', 'center', 'left'],
        columnWidths: ['4%', '15%', '10%', '22%', '22%', '14%', '13%'],
        orientation: 'landscape',
        filename: `Reestr_Metrologicheskih_Otchetov_DS_Engineering_${new Date().toISOString().slice(0, 10)}.pdf`
      });
      showToast('PDF-отчет по метрологическим протоколам сформирован');
    } catch (err) {
      console.error('Failed to export metrology reports PDF:', err);
      showToast('Ошибка при формировании PDF');
    } finally {
      setIsExportingPdf(false);
    }
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
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          showToast('Файл пуст или имеет неверный формат');
          return;
        }

        const newCerts: MetrologyReport[] = data.map((row, index) => {
          const matchedDevice = fleetDevices.find(d => 
            (row['Заводской серийный №'] && d.serialNumber === String(row['Заводской серийный №'])) ||
            (row['Применяемое оборудование'] && (d.modelName || '').toLowerCase().includes(String(row['Применяемое оборудование']).toLowerCase()))
          );

          return {
            id: `cert-import-${Date.now()}-${index}`,
            reportNumber: row['Номер отчета'] ? String(row['Номер отчета']) : `ОМК-2026-${Math.floor(100 + Math.random() * 900)}`,
            date: row['Дата выдачи'] ? String(row['Дата выдачи']) : new Date().toLocaleDateString('ru-RU'),
            objectName: row['Контактное лицо'] || row['Объект контроля'] || 'Контакт не указан',
            customer: row['Заказчик'] || 'Заказчик не указан',
            engineer: row['Метролог'] || row['Инженер'] || 'Ярыш И.В.',
            fleetDeviceId: matchedDevice?.id,
            equipment: row['Применяемое оборудование'] || row['Оборудование'] || matchedDevice?.modelName || 'Hexagon Absolute Arm',
            equipmentSerial: row['Заводской серийный №'] || matchedDevice?.serialNumber || '',
            inventoryNumber: row['Инвентарный №'] || matchedDevice?.inventoryNumber || '',
            verificationCertificate: row['Свидетельство о поверке'] || matchedDevice?.verificationNumber || '',
            verificationValidUntil: row['Срок действия поверки'] || matchedDevice?.verificationValidUntil || '',
            isVerificationExpired: false,
            files: []
          };
        });

        setMetrologyReports([...newCerts, ...metrologyReports]);
        newCerts.forEach(cert => apiService.saveCrmMetrologyReport(cert));
        showToast(`Успешно импортировано отчетов: ${newCerts.length}`);
      } catch (error) {
        console.error('Ошибка импорта Excel:', error);
        showToast('Ошибка при чтении файла Excel');
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  const handleSaveFile = (doc: AttachedDocument) => {
    if (!attachTarget) return;
    const updated = {
      ...attachTarget,
      files: [...(attachTarget.files || []), doc]
    };
    setMetrologyReports(metrologyReports.map(c => c.id === updated.id ? updated : c));
    apiService.updateCrmMetrologyReport(updated.id, updated);
    if (editingCert && editingCert.id === updated.id) {
      setEditingCert(updated);
    }
    setAttachTarget(null);
    showToast('Документ успешно прикреплен к отчету');
  };

  const handleDirectAttachFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0 || !editingCert) return;
    
    Array.from(filesList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileUrl = e.target?.result as string;
        const newDoc: AttachedDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          category: 'Скан отчета (PDF)',
          uploadedAt: new Date().toLocaleDateString('ru-RU'),
          size: `${(file.size / (1024 * 1024)).toFixed(2)} МБ`,
          fileUrl: fileUrl,
          fileType: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'doc'
        };

        setEditingCert(prev => {
          if (!prev) return null;
          const updated = {
            ...prev,
            files: [...(prev.files || []), newDoc]
          };
          setMetrologyReports(metrologyReports.map(c => c.id === updated.id ? updated : c));
          return updated;
        });
        showToast(`Файл «${file.name}» прикреплен`);
      };
      reader.readAsDataURL(file);
    });
  };

  const selectedFleetDevice = fleetDevices.find(d => d.id === editingCert?.fleetDeviceId);
  const selectedDeviceVerInfo = selectedFleetDevice 
    ? getDeviceVerificationInfo(selectedFleetDevice.verificationValidUntil) 
    : (editingCert?.verificationValidUntil ? getDeviceVerificationInfo(editingCert.verificationValidUntil) : null);

  const filteredFleetPickerDevices = fleetDevices.filter(d => {
    const q = equipmentSearchQuery.toLowerCase();
    return (
      (d.modelName || '').toLowerCase().includes(q) ||
      (d.brand || '').toLowerCase().includes(q) ||
      (d.serialNumber || '').toLowerCase().includes(q) ||
      (d.inventoryNumber && d.inventoryNumber.toLowerCase().includes(q)) ||
      (d.category && d.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Реестр метрологических отчетов
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Учет выданных отчетов и протоколов метрологического контроля с привязкой к применяемому оборудованию.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Hidden file input for Excel import */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImportExcel}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Импорт из Excel"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Импорт</span>
            </button>
            <button
              type="button"
              id="export-metrology-pdf-btn"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              title="Экспорт в PDF отчет"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">{isExportingPdf ? 'Создание PDF...' : 'Экспорт PDF'}</span>
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Экспорт в Excel"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            {hasCrmAccess && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить отчет</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar with Search and View Mode Switcher */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по номеру, контакту, заказчику, оборудованию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-xs font-semibold text-gray-500">
            Всего отчетов: <span className="text-gray-900 font-bold">{filteredCerts.length}</span>
          </div>

          {/* View Mode Toggle: Cards, Table, List */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-gray-900'
              }`}
              title="Вид карточками"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Карточки</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-gray-900'
              }`}
              title="Вид таблицей"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Таблица</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-gray-900'
              }`}
              title="Вид списком"
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Список</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDER CONTENT BASED ON VIEW MODE */}
      {filteredCerts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Метрологические отчеты не найдены</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {hasCrmAccess ? 'Попробуйте изменить поисковый запрос или добавьте новый отчет в базу.' : 'Отчеты для вашей компании пока отсутствуют.'}
          </p>
          {hasCrmAccess && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Добавить первый отчет
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCerts.map((cert) => {
            const verInfo = getDeviceVerificationInfo(cert.verificationValidUntil);
            return (
              <div
                key={cert.id}
                onClick={() => handleOpenEditModal(cert)}
                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top Bar: Number & Date */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-mono font-black border border-blue-100">
                      {cert.reportNumber}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{cert.date}</span>
                    </div>
                  </div>

                  {/* Customer and Contact */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-0.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{cert.customer}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate pl-5">
                      <User className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{cert.objectName}</span>
                    </div>
                  </div>

                  {/* Applied Equipment (Применяемое оборудование) */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span>Применяемое оборудование</span>
                    </div>
                    <div className="text-xs font-bold text-gray-900 truncate">
                      {cert.equipment || 'Оборудование не указано'}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {cert.equipmentSerial && (
                        <span className="px-1.5 py-0.5 bg-white text-slate-700 rounded border border-slate-200 font-mono font-bold">
                          Зав. № {cert.equipmentSerial}
                        </span>
                      )}
                      {cert.isVerificationExpired ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          Поверка истекла
                        </span>
                      ) : cert.verificationCertificate ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium border border-emerald-200 truncate max-w-[200px]" title={cert.verificationCertificate}>
                          <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
                          АРШИН: {cert.verificationCertificate}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Engineer, Files & Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                    <ClipboardCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{cert.engineer}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {cert.files && cert.files.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold text-[11px]">
                        <FileText className="w-3 h-3" />
                        {cert.files.length}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setAttachTarget(cert); }}
                        className="text-[11px] text-gray-400 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Paperclip className="w-3 h-3" />
                        + скан
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(cert); }}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                      title="Редактировать"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(cert.id, e)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors"
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
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              onClick={() => handleOpenEditModal(cert)}
              className="p-4 hover:bg-blue-50/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-blue-900 text-sm">{cert.reportNumber}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-semibold text-gray-900">{cert.customer}</span>
                    <span className="text-xs text-gray-500">({cert.objectName})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-blue-600" />
                      {cert.equipment}
                    </span>
                    {cert.equipmentSerial && (
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        № {cert.equipmentSerial}
                      </span>
                    )}
                    {cert.isVerificationExpired && (
                      <span className="text-red-600 font-bold text-[10px] bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                        Поверка истекла
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{cert.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{cert.engineer}</span>
                </div>
                {cert.files && cert.files.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold text-[11px] flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {cert.files.length}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAttachTarget(cert); }}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Прикрепить скан"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCloneReport(cert, e)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Дублировать отчет"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleOpenEditModal(cert); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(cert.id, e)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <HorizontalScrollContainer>
            <table className="w-full data-dense-table text-left text-xs whitespace-nowrap border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
              <tr>
                <th className="px-4 py-3">Номер отчета</th>
                <th className="px-4 py-3">Дата выдачи</th>
                <th className="px-4 py-3">Контактное лицо</th>
                <th className="px-4 py-3">Применяемое оборудование</th>
                <th className="px-4 py-3">Заказчик</th>
                <th className="px-4 py-3">Метролог</th>
                <th className="px-4 py-3 text-center">Файлы</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredCerts.map(cert => (
                  <tr 
                    key={cert.id} 
                    className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                    onClick={() => handleOpenEditModal(cert)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold font-mono text-blue-900">{cert.reportNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {cert.date}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {cert.objectName.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{cert.objectName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 max-w-[280px]">
                        <div className="font-bold text-gray-900 truncate">{cert.equipment}</div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          {cert.equipmentSerial && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono font-bold border border-slate-200">
                              № {cert.equipmentSerial}
                            </span>
                          )}
                          {cert.isVerificationExpired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-bold text-[10px] border border-red-200">
                              <AlertTriangle className="w-3 h-3" />
                              Поверка истекла
                            </span>
                          ) : cert.verificationCertificate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-medium text-[10px] border border-emerald-200 truncate max-w-[180px]" title={`Срок: до ${cert.verificationValidUntil || 'бессрочно'}`}>
                              <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
                              АРШИН: {cert.verificationCertificate}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{cert.customer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <ClipboardCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{cert.engineer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {cert.files && cert.files.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {cert.files.slice(0, 2).map((file, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setViewingDoc({doc: file, cert}); }}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-200"
                                title={file.name}
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            ))}
                            {cert.files.length > 2 && (
                              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-1 rounded-md">
                                +{cert.files.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAttachTarget(cert); }}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Прикрепить скан/PDF"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleCloneReport(cert, e)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Дублировать отчет"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEditModal(cert); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Редактировать"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(cert.id, e)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </HorizontalScrollContainer>
        </div>
      )}

      {/* EDIT / CREATE REPORT MODAL */}
      {isCertModalOpen && editingCert && (
        <div 
          className={`fixed inset-0 flex items-center justify-center bg-black/75 sm: backdrop-blur-xs overflow-hidden ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}
          style={{ zIndex: certModal.zIndex }}
        >
          <div 
            ref={certModal.containerRef}
            tabIndex={-1}
            className={`${isFullscreen ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none' : 'relative max-w-3xl w-full h-full max-h-[94vh] sm:max-h-[90vh] rounded-lg sm:rounded-lg'} bg-white shadow-xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
            style={isFullscreen ? { zIndex: certModal.zIndex + 1 } : undefined}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {metrologyReports.some(c => c.id === editingCert.id) ? 'Редактирование отчета' : 'Новый метрологический отчет'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Заполните параметры контроля, данные заказчика и применяемое СИ
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(prev => !prev)}
                  className="p-2 text-gray-400 hover:text-slate-500 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  title={isFullscreen ? "Свернуть в окно" : "На весь экран"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsCertModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-slate-500 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <form id="cert-form" onSubmit={handleSaveCertificate} className="space-y-6">
                
                {/* 1. Basic Report Details */}
                <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80 space-y-4">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Реквизиты отчета</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Номер отчета / протокола *</label>
                      <input
                        type="text"
                        required
                        placeholder="Например: ОМК-2026-104"
                        value={editingCert.reportNumber}
                        onChange={(e) => setEditingCert({ ...editingCert, reportNumber: e.target.value })}
                        className="w-full px-4.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono font-bold text-blue-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Дата выдачи отчета *</label>
                      <input
                        type="text"
                        required
                        placeholder="ДД.ММ.ГГГГ"
                        value={editingCert.date}
                        onChange={(e) => setEditingCert({ ...editingCert, date: e.target.value })}
                        className="w-full px-4.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Customer & Contact */}
                <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80 space-y-4">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Заказчик и контактное лицо</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500">Организация-заказчик *</label>
                        <button 
                          type="button" 
                          onClick={() => setIsCompModalOpen(true)}
                          className="text-[11px] text-blue-600 font-bold hover:text-blue-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Новая
                        </button>
                      </div>
                      <div className="relative">
                        <select
                          required
                          value={editingCert.customer}
                          onChange={(e) => setEditingCert({ ...editingCert, customer: e.target.value })}
                          className="w-full px-4.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none"
                        >
                          <option value="" disabled>Выберите организацию...</option>
                          {crmCompanies.map(c => (
                            <option key={c.id} value={c.name}>{c.name} {c.city ? `(г. ${c.city})` : ''}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500">Контактное лицо *</label>
                        <button 
                          type="button" 
                          onClick={() => setIsContModalOpen(true)}
                          className="text-[11px] text-blue-600 font-bold hover:text-blue-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Новый
                        </button>
                      </div>
                      <div className="relative">
                        <select
                          required
                          value={editingCert.objectName}
                          onChange={(e) => setEditingCert({ ...editingCert, objectName: e.target.value })}
                          className="w-full px-4.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none"
                        >
                          <option value="" disabled>Выберите контактное лицо...</option>
                          {crmContacts
                            .filter(c => !editingCert.customer || (crmCompanies.find(comp => comp.name === editingCert.customer)?.id === c.companyId))
                            .map(c => (
                              <option key={c.id} value={c.fullName}>{c.fullName} {c.position ? `— ${c.position}` : ''}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Метролог-Исполнитель *</label>
                    <div className="relative">
                      <select
                        required
                        value={editingCert.engineer}
                        onChange={(e) => setEditingCert({ ...editingCert, engineer: e.target.value })}
                        className="w-full px-4.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none"
                      >
                        <option value="" disabled>Выберите инженера-метролога...</option>
                        {authUsers.filter(u => u.role !== 'client').map(u => (
                          <option key={u.id} value={u.fullName}>{u.fullName} {u.position ? `(${u.position})` : ''}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. APPLIED EQUIPMENT (Применяемое оборудование) */}
                <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200/90 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      <span>Применяемое оборудование (СИ)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEquipmentPickerOpen(true)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-blue-200/60"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        Каталог с фото и паспортами
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFleetDevice('custom')}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border ${
                          !editingCert.fleetDeviceId ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Ввести вручную
                      </button>
                    </div>
                  </div>

                  {/* Fast Quick-Select Equipment Pills */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Быстрый выбор из парка «ДС-Инжиниринг»:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                      {fleetDevices.map(device => {
                        const isSelected = editingCert.fleetDeviceId === device.id;
                        return (
                          <button
                            key={device.id}
                            type="button"
                            onClick={() => handleSelectFleetDevice(device.id)}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/80 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 truncate">
                                {device.brand}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              )}
                            </div>
                            <div className="text-xs font-bold text-gray-900 line-clamp-1 leading-tight">
                              {device.modelName}
                            </div>
                            <div className="mt-1 text-[10px] text-gray-500 font-mono flex items-center justify-between">
                              <span>№ {device.serialNumber}</span>
                              <span className="text-emerald-600 font-medium">АРШИН</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct Dropdown Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                      <span>Выбрать прибор из списка базы данных:</span>
                      <span className="text-[10px] text-blue-600 font-normal">Синхронизировано с реестром оборудования</span>
                    </label>
                    <select
                      value={editingCert.fleetDeviceId || 'custom'}
                      onChange={(e) => handleSelectFleetDevice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-lg text-xs text-gray-900 font-semibold focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                    >
                      <option value="custom">-- Ввести СИ вручную / Другое оборудование --</option>
                      {fleetDevices.map(device => (
                        <option key={device.id} value={device.id}>
                          ⭐ {device.modelName} (Зав. № {device.serialNumber} • Инв. {device.inventoryNumber} • Поверка: {device.verificationNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Device Preview Card */}
                  {selectedFleetDevice ? (
                    <div className="p-3.5 bg-white rounded-lg border border-blue-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {selectedFleetDevice.photoUrl ? (
                            <img src={selectedFleetDevice.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Wrench className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            {selectedFleetDevice.brand} • {selectedFleetDevice.category || 'КИМ'}
                          </div>
                          <div className="text-sm font-bold text-gray-900">{selectedFleetDevice.modelName}</div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5 font-mono">
                            <span>Зав. №: <b className="text-gray-800">{selectedFleetDevice.serialNumber}</b></span>
                            <span>•</span>
                            <span>Инв. №: <b className="text-gray-800">{selectedFleetDevice.inventoryNumber}</b></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        {selectedDeviceVerInfo?.isExpired ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg font-bold text-xs border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Поверка просрочена
                          </div>
                        ) : selectedDeviceVerInfo?.isExpiringSoon ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold text-xs border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            {selectedDeviceVerInfo.text}
                          </div>
                        ) : selectedFleetDevice.verificationNumber ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-semibold text-xs border border-emerald-200">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            АРШИН: {selectedFleetDevice.verificationNumber}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {/* Manual Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Модель прибора *</label>
                      <input
                        type="text"
                        required
                        placeholder="Например: Hexagon Absolute Arm 8525-7"
                        value={editingCert.equipment}
                        onChange={(e) => setEditingCert({ ...editingCert, equipment: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 font-semibold focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Заводской серийный №</label>
                      <input
                        type="text"
                        placeholder="Зав. №"
                        value={editingCert.equipmentSerial || ''}
                        onChange={(e) => setEditingCert({ ...editingCert, equipmentSerial: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Свидетельство о поверке (АРШИН)</label>
                      <input
                        type="text"
                        placeholder="Номер свидетельства"
                        value={editingCert.verificationCertificate || ''}
                        onChange={(e) => setEditingCert({ ...editingCert, verificationCertificate: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Verification Status Warning / Banner */}
                  {(() => {
                    const verInfo = getDeviceVerificationInfo(editingCert.verificationValidUntil);
                    if (verInfo.isExpired) {
                      return (
                        <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2.5 text-red-900 text-xs">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Внимание: Срок поверки прибора истек {editingCert.verificationValidUntil ? `(${new Date(editingCert.verificationValidUntil).toLocaleDateString('ru-RU')})` : ''}!</span>
                            <p className="text-red-700 mt-0.5">Прибор требует очередной поверки во ФГИС «АРШИН» перед выдачей официальных протоколов.</p>
                          </div>
                        </div>
                      );
                    }
                    if (verInfo.isExpiringSoon) {
                      return (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2 text-amber-900 text-xs">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Срок поверки истекает через {verInfo.daysLeft} дн.</span> (до {editingCert.verificationValidUntil ? new Date(editingCert.verificationValidUntil).toLocaleDateString('ru-RU') : ''}).
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </form>

              {/* 4. Files Section inside Modal */}
              <div className="space-y-3 pt-2">
                <input
                  type="file"
                  id="cert-file-direct-input"
                  ref={certFileInputRef}
                  onChange={(e) => {
                    handleDirectAttachFiles(e.target.files);
                    if (e.target) e.target.value = '';
                  }}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span>Прикрепленные протоколы и сканы {editingCert.files && editingCert.files.length > 0 && `(${editingCert.files.length})`}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => certFileInputRef.current?.click()}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Загрузить файлы
                    </button>
                  </div>
                </div>

                {(!editingCert.files || editingCert.files.length === 0) ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(false);
                      handleDirectAttachFiles(e.dataTransfer.files);
                    }}
                    onClick={() => certFileInputRef.current?.click()}
                    className={`text-center py-6 px-4 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                      isDraggingFile
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50/80 bg-slate-50'
                    }`}
                  >
                    <UploadCloud className="w-7 h-7 text-blue-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-500">Нажмите для выбора файлов или перетащите скан сюда</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">PDF, JPEG, PNG, DOCX (до 50 МБ)</p>
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {editingCert.files.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>{file.category}</span>
                              <span>•</span>
                              <span>{file.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewingDoc({doc: file, cert: editingCert})}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Просмотр"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Удалить файл?')) {
                                const updated = {
                                  ...editingCert,
                                  files: editingCert.files?.filter(f => f.id !== file.id)
                                };
                                setEditingCert(updated);
                                setMetrologyReports(metrologyReports.map(c => c.id === updated.id ? updated : c));
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                form="cert-form"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Сохранить отчет
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EQUIPMENT PICKER MODAL */}
      {isEquipmentPickerOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: equipmentPickerModal.zIndex }}
        >
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsEquipmentPickerOpen(false)} />
          <div 
            ref={equipmentPickerModal.containerRef}
            tabIndex={-1}
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] z-10"
          >
            <div className="p-5 border-b border-gray-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Выбор применяемого оборудования</h3>
              </div>
              <button
                onClick={() => setIsEquipmentPickerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-slate-500 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск по модели, бренду, серийному или инвентарному номеру..."
                  value={equipmentSearchQuery}
                  onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredFleetPickerDevices.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  Приборы по запросу не найдены
                </div>
              ) : (
                filteredFleetPickerDevices.map(dev => {
                  const ver = getDeviceVerificationInfo(dev.verificationValidUntil);
                  const isSelected = editingCert?.fleetDeviceId === dev.id;
                  return (
                    <div
                      key={dev.id}
                      onClick={() => handleSelectFleetDevice(dev.id)}
                      className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {dev.photoUrl ? (
                            <img src={dev.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Wrench className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            {dev.brand} • {dev.category || 'КИМ'}
                          </div>
                          <div className="text-xs font-bold text-gray-900">{dev.modelName}</div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono mt-0.5">
                            <span>Зав: <b>{dev.serialNumber}</b></span>
                            <span>•</span>
                            <span>Инв: <b>{dev.inventoryNumber}</b></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ver.isExpired ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">
                            Просрочен
                          </span>
                        ) : dev.verificationNumber ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-medium border border-emerald-200">
                            АРШИН: {dev.verificationNumber}
                          </span>
                        ) : null}

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-slate-50/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSelectFleetDevice('custom')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
              >
                Ввести реквизиты прибора вручную
              </button>
              <button
                type="button"
                onClick={() => setIsEquipmentPickerOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attach File Modal */}
      {attachTarget && (
        <AccountFileModal
          parentTitle={`Метрологический отчет №${attachTarget.reportNumber}`}
          defaultCategories={['Скан отчета (PDF)', 'Доп. материалы']}
          onClose={() => setAttachTarget(null)}
          onSave={handleSaveFile}
        />
      )}

      {/* View Document Modal */}
      {viewingDoc && (
        <AccountDocViewerModal
          document={viewingDoc.doc}
          parentTitle={`Метрологический отчет №${viewingDoc.cert.reportNumber}`}
          parentEntityNumber={viewingDoc.cert.reportNumber}
          onClose={() => setViewingDoc(null)}
          canDelete={true}
          onDelete={() => {
            const updated = {
              ...viewingDoc.cert,
              files: viewingDoc.cert.files?.filter(f => f.id !== viewingDoc.doc.id)
            };
            setMetrologyReports(prev => prev.map(c => c.id === updated.id ? updated : c));
            if (editingCert && editingCert.id === updated.id) {
              setEditingCert(updated);
            }
            setViewingDoc(null);
            showToast('Файл удален');
          }}
        />
      )}

      {/* CRM Modals */}
      {isCompModalOpen && (
        <CompanyModal
          isOpen={isCompModalOpen}
          onClose={() => setIsCompModalOpen(false)}
          onSave={async (comp) => {
            const res = await apiService.saveCrmCompany(comp);
            if (res.success) {
              const compRes = await apiService.getCrmCompanies();
              if (compRes.success) {
                setCrmCompanies(compRes.data);
                const savedName = res.data?.name || comp.name;
                if (savedName && editingCert) {
                  setEditingCert(prev => prev ? { ...prev, customer: savedName } : null);
                }
              }
              setIsCompModalOpen(false);
              showToast('Предприятие успешно добавлено в базу!');
            } else {
              showToast(res.message || 'Ошибка при добавлении предприятия');
            }
          }}
          contacts={crmContacts}
          tasks={[]}
          onOpenTaskModal={() => {}}
          onOpenEventModal={() => {}}
          onDelete={async () => {}}
        />
      )}

      {isContModalOpen && (
        <ContactModal
          isOpen={isContModalOpen}
          onClose={() => setIsContModalOpen(false)}
          onSave={async (cont) => {
            const res = await apiService.saveCrmContact(cont);
            if (res.success) {
              const contRes = await apiService.getCrmContacts();
              if (contRes.success) {
                setCrmContacts(contRes.data);
                const savedFullName = res.data?.fullName || cont.fullName;
                if (savedFullName && editingCert) {
                  setEditingCert(prev => prev ? { ...prev, objectName: savedFullName } : null);
                }
              }
              setIsContModalOpen(false);
              showToast('Контакт успешно добавлен в базу!');
            } else {
              showToast(res.message || 'Ошибка при добавлении контакта');
            }
          }}
          companies={crmCompanies}
          initialCompanyId={crmCompanies.find(c => c.name === editingCert?.customer)?.id}
          onAddInteraction={async () => {}}
        />
      )}
    </div>
  );
};
