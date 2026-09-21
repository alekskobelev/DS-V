import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';
import { RegistryToolbar } from '../common/RegistryToolbar';
import { exportTableToPdf } from '../../utils/exportTablePdf';

import { 
  Search, Plus, FileText, Download, Upload,
  Trash2, X, Award, Calendar, User, Building2,
  UserCheck, Edit3, Paperclip, Eye, UploadCloud,
  Maximize2, Minimize2, Printer, CheckCircle2,
  Clock, ShieldCheck, Filter, Layers, ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TrainingCertificate, AttachedDocument, CrmCompany, CrmContact } from '../../types';
import { AccountFileModal } from '../account/AccountFileModal';
import { AccountDocViewerModal } from '../account/AccountDocViewerModal';
import { apiService } from '../../services/apiService';
import { CompanyModal } from './CompanyModal';
import { ContactModal } from './ContactModal';
import { CertificateVisualEditorModal } from './CertificateVisualEditorModal';
import { CertificatePrintModal } from './CertificatePrintModal';
import { DEFAULT_CERTIFICATES } from '../../data/defaultCertificates';
import { getUserPermissions } from '../../types';

export const CertificatesRegistry: React.FC = () => {
  const { certificates, setCertificates, showToast, authUsers, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [filesFilter, setFilesFilter] = useState<'all' | 'with_files' | 'no_files'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const userPerms = useMemo(() => getUserPermissions(currentUser), [currentUser]);
  const hasCrmAccess = currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || !!userPerms?.canAccessCrm;
  
  // Visual Editor and Print Modals
  const [visualEditorCert, setVisualEditorCert] = useState<TrainingCertificate | null>(null);
  const [printingCert, setPrintingCert] = useState<TrainingCertificate | null>(null);
  
  // File attachments modal state
  const [attachTarget, setAttachTarget] = useState<TrainingCertificate | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{doc: AttachedDocument, cert: TrainingCertificate} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // CRM Integration State
  const [crmCompanies, setCrmCompanies] = useState<CrmCompany[]>([]);
  const [crmContacts, setCrmContacts] = useState<CrmContact[]>([]);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [isContModalOpen, setIsContModalOpen] = useState(false);

  // Load persistent certificates and CRM directory from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/crm/certificates');
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length > 0) {
            setCertificates(data);
          } else if (certificates.length === 0) {
            setCertificates(DEFAULT_CERTIFICATES);
          }
        }
      } catch (e) {
        console.warn('Backend certificates fetch fallback:', e);
        if (certificates.length === 0) {
          setCertificates(DEFAULT_CERTIFICATES);
        }
      }

      const compRes = await apiService.getCrmCompanies();
      if (compRes.success) setCrmCompanies(compRes.data);
      const contRes = await apiService.getCrmContacts();
      if (contRes.success) setCrmContacts(contRes.data);
    };
    fetchData();
  }, []);

  // Filter logic
  const filteredCerts = useMemo(() => {
    return certificates.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        c.certificateNumber.toLowerCase().includes(q) ||
        c.traineeName.toLowerCase().includes(q) ||
        c.customer.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        (c.trainingTopic && c.trainingTopic.toLowerCase().includes(q))
      );

      const matchesType = typeFilter === 'all' || c.certificateType === typeFilter;

      const hasFiles = (c.files && c.files.length > 0);
      const matchesFiles = filesFilter === 'all' || 
        (filesFilter === 'with_files' && hasFiles) || 
        (filesFilter === 'no_files' && !hasFiles);

      return matchesSearch && matchesType && matchesFiles;
    });
  }, [certificates, searchQuery, typeFilter, filesFilter]);

  // Open creation modal
  const handleOpenAddModal = () => {
    const nextSeq = certificates.length + 1;
    const padSeq = nextSeq < 10 ? `0${nextSeq}` : `${nextSeq}`;
    const newCert: TrainingCertificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: `СВ-2026/${padSeq}`,
      date: new Date().toLocaleDateString('ru-RU'),
      traineeName: '',
      traineePosition: 'Инженер-метролог',
      customer: '',
      trainingTopic: 'Стационарная КИМ HEXAGON GLOBAL S Chrome и ПО PolyWorks|Inspector™',
      certificateType: 'training',
      templateTheme: 'corporate_gold',
      customPrimaryColor: '#0284c7',
      instructor: 'Некрасов Сергей Юрьевич',
      hoursTotal: 40,
      protocolNumber: `ПР-АТТ-${padSeq}/26`,
      protocolDate: new Date().toLocaleDateString('ru-RU'),
      validUntil: 'Бессрочно',
      showStamp: true,
      showSignature: true,
      showQrCode: true,
      files: []
    };
    setVisualEditorCert(newCert);
  };

  // Open edit modal
  const handleOpenEditModal = (cert: TrainingCertificate) => {
    setVisualEditorCert({ ...cert });
  };

  // Save certificate (syncing to backend API + state)
  const handleSaveCertificate = async (savedCert: TrainingCertificate) => {
    const exists = certificates.some(c => c.id === savedCert.id);
    let updatedList: TrainingCertificate[];

    if (exists) {
      updatedList = certificates.map(c => c.id === savedCert.id ? savedCert : c);
    } else {
      updatedList = [savedCert, ...certificates];
    }
    setCertificates(updatedList);

    try {
      await fetch('/api/crm/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedCert)
      });
    } catch (e) {
      console.warn('Backend persistence error:', e);
    }

    showToast(exists ? 'Свидетельство успешно обновлено' : 'Новое свидетельство успешно создано');
  };

  // Delete certificate
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить это свидетельство из реестра?')) {
      const updated = certificates.filter(c => c.id !== id);
      setCertificates(updated);

      try {
        await fetch(`/api/crm/certificates/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Backend deletion error:', e);
      }
      showToast('Свидетельство удалено');
    }
  };

  // Trigger Print / Export Dialog
  const handleOpenPrintModal = (cert: TrainingCertificate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPrintingCert(cert);
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // PDF Export
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportTableToPdf({
        title: 'Реестр выданных свидетельств и сертификатов аттестации',
        subtitle: 'ООО «ДС-Инжиниринг» • Учебный центр & Департамент технического обучения',
        department: 'Метрологический Учебный Центр КИМ и CAD/CAM',
        filterInfo: searchQuery ? `Поиск: "${searchQuery}"` : typeFilter !== 'all' ? `Категория: ${typeFilter}` : 'Все свидетельства',
        summaryBadges: [
          { label: 'Всего свидетельств', value: filteredCerts.length, color: 'blue' },
          { label: 'Обучение КИМ', value: filteredCerts.filter(c => c.trainingTopic?.toLowerCase().includes('ким') || c.certificateType === 'training').length, color: 'indigo' },
          { label: 'Со сканами', value: filteredCerts.filter(c => (c.files?.length || 0) > 0).length, color: 'green' }
        ],
        headers: ['№', 'Номер свидетельства', 'Дата', 'ФИО специалиста', 'Организация-заказчик', 'Тема обучения', 'Инструктор'],
        rows: filteredCerts.map((cert, idx) => [
          String(idx + 1),
          String(cert.certificateNumber || '—'),
          String(cert.date || '—'),
          { text: cert.traineeName || '—', subtext: cert.traineePosition },
          String(cert.customer || '—'),
          { text: cert.trainingTopic || 'Курс обучения', subtext: cert.protocolNumber ? `Протокол: ${cert.protocolNumber}` : undefined },
          String(cert.instructor || 'Некрасов С.Ю.')
        ]),
        columnAlignments: ['center', 'center', 'center', 'left', 'left', 'left', 'left'],
        columnWidths: ['4%', '16%', '10%', '20%', '20%', '18%', '12%'],
        orientation: 'landscape',
        filename: `Reestr_Svidetelstv_DS_Engineering_${new Date().toISOString().slice(0, 10)}.pdf`
      });
      showToast('PDF-отчет успешно сформирован и сохранен');
    } catch (err) {
      console.error('Failed to export certs PDF:', err);
      showToast('Ошибка при формировании PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Excel / CSV Export with automatic fallback
  const exportToExcel = async () => {
    try {
      const dataToExport = filteredCerts.map(cert => ({
        'Номер свидетельства': cert.certificateNumber,
        'Дата выдачи': cert.date,
        'Тип документа': cert.certificateType === 'briefing' ? 'Инструктаж' :
                         cert.certificateType === 'qualification' ? 'Квалификация' :
                         cert.certificateType === 'software_cert' ? 'Сертификат ПО' : 'Обучение',
        'ФИО Обучающегося': cert.traineeName,
        'Должность': cert.traineePosition || '',
        'Заказчик (Организация)': cert.customer,
        'Тема курса': cert.trainingTopic || '',
        'Объем (часы)': cert.hoursTotal || 40,
        'Инструктор': cert.instructor,
        'Протокол': cert.protocolNumber || '',
        'Срок действия': cert.validUntil || 'Бессрочно',
        'Кол-во файлов': cert.files?.length || 0
      }));

      try {
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Свидетельства');
        
        ws['!cols'] = [
          { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 28 }, { wch: 22 }, 
          { wch: 26 }, { wch: 35 }, { wch: 14 }, { wch: 25 }, { wch: 16 }, 
          { wch: 14 }, { wch: 12 }
        ];

        const fileName = `Реестр_Свидетельств_ДС_Инжиниринг_${new Date().toLocaleDateString('ru-RU')}.xlsx`;
        XLSX.writeFile(wb, fileName);
        showToast('Реестр свидетельств успешно экспортирован в Excel');
      } catch (xlsxErr) {
        // Fallback to UTF-8 CSV
        console.warn('XLSX export fallback to CSV:', xlsxErr);
        const headers = Object.keys(dataToExport[0] || {});
        const rows = dataToExport.map(row => headers.map(h => `"${String((row as any)[h] || '').replace(/"/g, '""')}"`).join(';'));
        const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Реестр_Свидетельств_ДС_Инжиниринг_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Реестр экспортирован (CSV с поддержкой Excel)');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast('Ошибка при экспорте реестра');
    }
  };

  // Excel / CSV Import
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

        const newCerts: TrainingCertificate[] = data.map((row, index) => ({
          id: `cert-imp-${Date.now()}-${index}`,
          certificateNumber: row['Номер свидетельства'] || row['Номер'] || `ИМП-${Date.now()}-${index}`,
          date: row['Дата выдачи'] || row['Дата'] || new Date().toLocaleDateString('ru-RU'),
          traineeName: row['ФИО Обучающегося'] || row['ФИО'] || 'Не указано',
          traineePosition: row['Должность'] || '',
          customer: row['Заказчик (Организация)'] || row['Заказчик'] || 'Не указано',
          trainingTopic: row['Тема курса'] || row['Тематика'] || 'Обучение работе на оборудовании',
          certificateType: 'training',
          templateTheme: 'corporate_gold',
          instructor: row['Инструктор'] || 'Некрасов Сергей Юрьевич',
          hoursTotal: Number(row['Объем (часы)']) || 40,
          protocolNumber: row['Протокол'] || '',
          validUntil: row['Срок действия'] || 'Бессрочно',
          showStamp: true,
          showSignature: true,
          showQrCode: true,
          files: []
        }));

        if (newCerts.length > 0) {
          const combined = [...newCerts, ...certificates];
          setCertificates(combined);
          // Persist batch to backend
          fetch('/api/crm/certificates', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(combined)
          }).catch(console.warn);
          showToast(`Успешно импортировано ${newCerts.length} свидетельств`);
        } else {
          showToast('Не найдено записей для импорта');
        }
      } catch (error) {
        console.error('Import error:', error);
        showToast('Ошибка при чтении файла');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle direct file upload from AccountFileModal
  const handleSaveFile = (doc: AttachedDocument) => {
    if (!attachTarget) return;

    const updatedCertificates = certificates.map(c => {
      if (c.id === attachTarget.id) {
        const updated = {
          ...c,
          files: [...(c.files || []), doc]
        };
        // sync to backend
        fetch('/api/crm/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        }).catch(console.warn);
        return updated;
      }
      return c;
    });

    setCertificates(updatedCertificates);
    setAttachTarget(null);
    showToast('Скан документа успешно прикреплен');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Main Actions */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">
                  Реестр Свидетельств об обучении и инструктажах
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {certificates.length} в реестре
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Полнофункциональный конструктор, визуальный редактор А4, учет и печать свидетельств ООО «ДС-Инжиниринг».
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Hidden file input for Excel import */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImportExcel}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            
            <button
              id="btn-certs-import"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Импорт из Excel (.xlsx / .csv)"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Импорт</span>
            </button>

            <button
              id="btn-certs-pdf"
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              title="Выгрузить реестр в PDF отчет"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">{isExportingPdf ? 'Создание PDF...' : 'Экспорт PDF'}</span>
            </button>

            <button
              id="btn-certs-export"
              type="button"
              onClick={exportToExcel}
              className="px-4.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Выгрузить реестр в Excel или CSV"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {hasCrmAccess && (
              <button
                id="btn-certs-create"
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Создать свидетельство</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Badges Ribbon */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Категория:</span>
          </span>

          {[
            { id: 'all', label: 'Все свидетельства' },
            { id: 'training', label: 'Обучение КИМ' },
            { id: 'briefing', label: 'Инструктажи по ТБ' },
            { id: 'qualification', label: 'Квалификация' },
            { id: 'software_cert', label: 'Сертификаты ПО' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={`px-4 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-slate-300 mx-1 hidden sm:block" />

          {/* Scans filter */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilesFilter(filesFilter === 'with_files' ? 'all' : 'with_files')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filesFilter === 'with_files'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Paperclip className="w-3 h-3" />
              <span>Только со сканами</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unified Registry Toolbar */}
      <RegistryToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalCount={filteredCerts.length}
        searchPlaceholder="Поиск по номеру, ФИО специалиста, заказчику, теме..."
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        onExportExcel={exportToExcel}
      />

      {/* 1. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <HorizontalScrollContainer>
            <table className="w-full data-dense-table text-left text-xs whitespace-nowrap border-collapse min-w-[1050px]">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Номер свидетельства</th>
                  <th className="px-4 py-3">Дата выдачи</th>
                  <th className="px-4 py-3">Кому (ФИО специалиста)</th>
                  <th className="px-4 py-3">Предприятие-заказчик</th>
                  <th className="px-4 py-3">Тематика курса / ПО</th>
                  <th className="px-4 py-3">Инструктор</th>
                  <th className="px-4 py-3 text-center">Сканы</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">
                      <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-700 font-medium">Свидетельства не найдены</p>
                      <p className="text-xs text-slate-400 mt-1">Попробуйте изменить параметры поиска или создайте новое</p>
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map(cert => (
                    <tr 
                      key={cert.id} 
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => handleOpenEditModal(cert)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-blue-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-mono">{cert.certificateNumber}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {cert.certificateType === 'briefing' ? 'Инструктаж' :
                           cert.certificateType === 'qualification' ? 'Квалификация' :
                           cert.certificateType === 'software_cert' ? 'Сертификат ПО' : 'Обучение'}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cert.date}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {cert.traineeName ? cert.traineeName.charAt(0) : '?'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{cert.traineeName}</span>
                            {cert.traineePosition && (
                              <div className="text-[11px] text-slate-500">{cert.traineePosition}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-semibold">{cert.customer}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-[220px] truncate text-slate-700" title={cert.trainingTopic || ''}>
                          {cert.trainingTopic || 'Курс метрологического контроля'}
                        </div>
                        <div className="text-[10px] text-blue-600 font-semibold">
                          {cert.hoursTotal || 40} ак. ч.
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <UserCheck className="w-4 h-4 text-blue-600/80 shrink-0" />
                          <span>{cert.instructor}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {cert.files && cert.files.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {cert.files.slice(0, 2).map((file, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setViewingDoc({doc: file, cert}); }}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-200 cursor-pointer"
                                  title={file.name}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              ))}
                              {cert.files.length > 2 && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  +{cert.files.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print / PDF modal trigger */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenPrintModal(cert, e)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Открыть просмотр и печать бланка"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Attach file */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setAttachTarget(cert); }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Прикрепить скан или PDF"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>

                          {/* Visual Editor */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(cert); }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Редактировать в визуальном редакторе"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(cert.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Удалить свидетельство"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </HorizontalScrollContainer>
        </div>
      )}

      {/* 2. CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCerts.map(cert => (
            <div 
              key={cert.id}
              onClick={() => handleOpenEditModal(cert)}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {cert.certificateNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">{cert.date} г.</div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {cert.hoursTotal || 40} ч.
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Специалист</span>
                    <div className="text-sm font-bold text-slate-900">{cert.traineeName}</div>
                    {cert.traineePosition && (
                      <div className="text-xs text-slate-500">{cert.traineePosition}</div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Предприятие</span>
                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cert.customer}</span>
                    </div>
                  </div>

                  {cert.trainingTopic && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Курс</span>
                      <div className="text-xs text-slate-700 line-clamp-2 mt-0.5">
                        {cert.trainingTopic}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{cert.instructor}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleOpenPrintModal(cert, e)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Печать"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAttachTarget(cert); }}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Прикрепить файл"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(cert.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {filteredCerts.map(cert => (
            <div
              key={cert.id}
              onClick={() => handleOpenEditModal(cert)}
              className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{cert.certificateNumber}</span>
                    <span className="text-xs text-slate-400">• {cert.date}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    <strong>{cert.traineeName}</strong> — {cert.customer}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleOpenPrintModal(cert, e)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Печать</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleOpenEditModal(cert); }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visual Editor Modal (CMS-style WYSIWYG + A4 Live Preview) */}
      {visualEditorCert && (
        <CertificateVisualEditorModal
          certificate={visualEditorCert}
          isOpen={!!visualEditorCert}
          onClose={() => setVisualEditorCert(null)}
          onSave={async (updatedCert) => {
            await handleSaveCertificate(updatedCert);
            setVisualEditorCert(null);
          }}
          crmCompanies={crmCompanies}
          crmContacts={crmContacts}
          authUsers={authUsers}
          onCompanyCreated={(newComp) => {
            setCrmCompanies(prev => {
              if (prev.some(c => c.name === newComp.name)) return prev;
              return [newComp as any, ...prev];
            });
          }}
          onOpenNewCompanyModal={() => setIsCompModalOpen(true)}
          onViewDocument={(doc, cert) => setViewingDoc({ doc, cert })}
        />
      )}

      {/* Certificate Dedicated Print & PDF Export Modal */}
      {printingCert && (
        <CertificatePrintModal
          certificate={printingCert}
          isOpen={!!printingCert}
          onClose={() => setPrintingCert(null)}
        />
      )}

      {/* Attachment Upload Modal */}
      {attachTarget && (
        <AccountFileModal
          parentTitle={`Свидетельство № ${attachTarget.certificateNumber}`}
          onClose={() => setAttachTarget(null)}
          onSave={handleSaveFile}
          defaultCategories={['Скан свидетельства (PDF)', 'Дополнительные материалы', 'Протокол аттестации']}
        />
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <AccountDocViewerModal
          onClose={() => setViewingDoc(null)}
          document={viewingDoc.doc}
          parentTitle={`Свидетельство № ${viewingDoc.cert.certificateNumber}`}
        />
      )}

      {/* CRM Company Quick Creation Modal */}
      {isCompModalOpen && (
        <CompanyModal
          isOpen={isCompModalOpen}
          onClose={() => setIsCompModalOpen(false)}
          onSave={async (companyData) => {
            if (companyData.name) {
              const fullComp: CrmCompany = {
                id: companyData.id || `comp-${Date.now()}`,
                name: companyData.name,
                inn: companyData.inn || '',
                city: companyData.city || 'Самара',
                industry: companyData.industry || 'Машиностроение',
                status: companyData.status || 'active',
                assignedEquipment: companyData.assignedEquipment || [],
                phone: companyData.phone || '',
                email: companyData.email || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setCrmCompanies(prev => [fullComp, ...prev]);
              showToast(`Компания «${fullComp.name}» добавлена в CRM`);
            }
            setIsCompModalOpen(false);
          }}
        />
      )}

      {/* CRM Contact Quick Creation Modal */}
      {isContModalOpen && (
        <ContactModal
          isOpen={isContModalOpen}
          onClose={() => setIsContModalOpen(false)}
          onSave={async (contactData) => {
            if (contactData.fullName) {
              const fullCont: CrmContact = {
                id: contactData.id || `cont-${Date.now()}`,
                fullName: contactData.fullName,
                companyId: contactData.companyId || '',
                companyName: contactData.companyName || '',
                position: contactData.position || '',
                mobilePhone: contactData.mobilePhone || '',
                workPhone: contactData.workPhone || '',
                email: contactData.email || '',
                isDecisionMaker: contactData.isDecisionMaker ?? false,
                interactionHistory: contactData.interactionHistory || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setCrmContacts(prev => [fullCont, ...prev]);
              showToast(`Контакт «${fullCont.fullName}» добавлен в CRM`);
            }
            setIsContModalOpen(false);
          }}
          companies={crmCompanies}
        />
      )}
    </div>
  );
};
