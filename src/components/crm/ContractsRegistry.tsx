import React, { useState, useRef, useMemo } from 'react';
import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';
import { RegistryToolbar } from '../common/RegistryToolbar';

import { KeyRound, LifeBuoy, 
  Search, 
  Plus, 
  Upload, 
  Download, 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText, 
  Paperclip, 
  Building2, 
  User, 
  Phone, 
  FileSpreadsheet, 
  Calendar,
  Shield,
  Link2,
  ChevronDown,
  Layers,
  Maximize2,
  Minimize2,
  Copy
} from 'lucide-react';
import { ProjectContract, AttachedDocument, CrmCompany, CrmContact, CurrencyCode, getCurrencySymbol } from '../../types';
import { CrmDeal } from '../../data/mockCrmData';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { CompanyModal } from './CompanyModal';
import { ContactModal } from './ContactModal';
import { getStaffMemberInfo } from '../../utils/staffDirectory';
import { exportTableToPdf } from '../../utils/exportTablePdf';

interface ContractsRegistryProps {
  contracts?: ProjectContract[];
  setContracts?: React.Dispatch<React.SetStateAction<ProjectContract[]>>;
  deals?: CrmDeal[];
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  'Действует': { label: 'Действует', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  'Выполнен (На гарантии)': { label: 'Выполнен (На гарантии)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Сдан в эксплуатацию': { label: 'Сдан в эксплуатацию', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  'Исполняется': { label: 'Исполняется', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  'Подписан': { label: 'Подписан', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'В процессе подписания': { label: 'В процессе подписания', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  'На согласовании': { label: 'На согласовании', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  'Проект': { label: 'Проект', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'Приостановлен': { label: 'Приостановлен', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  'Расторгнут': { label: 'Расторгнут', color: 'bg-gray-200 text-slate-500 border-gray-300' },
  'Завершен': { label: 'Завершен', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export const ContractsRegistry: React.FC<ContractsRegistryProps> = ({ 
  contracts: propContracts, 
  setContracts: propSetContracts,
  deals = []
}) => {
  const { 
    contracts, 
    setContracts, 
    addContract, 
    updateContract, 
    deleteContract, 
    showToast,
    isAdmin,
    userPermissions,
    authUsers,
    licenses,
    supportTickets
  } = useApp();

  // Use unified contracts from AppContext if not explicitly provided
  const currentContracts = propContracts || contracts;
  const setCurrentContracts = propSetContracts || setContracts;

  const canEdit = isAdmin || userPermissions?.canManageContracts || userPermissions?.canEditDeals;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState<ProjectContract | null>(null);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

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

  // New Document upload state inside modal
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<AttachedDocument['category']>('Договор и приложения');
  const [newDocSize, setNewDocSize] = useState('1.5 MB');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<ProjectContract>>({
    number: '',
    title: '',
    company: '',
    date: new Date().toLocaleDateString('ru-RU'),
    status: 'Исполняется',
    statusColor: 'blue',
    supportUntil: '',
    curator: 'Скобелев Александр Сергеевич',
    curatorPhone: '+7 (937) 984-61-51',
    amount: 'По договору',
    currency: 'RUB',
    scope: '',
    documents: [],
    dealId: '',
    dealTitle: ''
  });

  // Filter contracts
  const filtered = useMemo(() => {
    return currentContracts.filter(c => {
      const matchesSearch = 
        (c.number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.curator && c.curator.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.dealId && c.dealId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.dealTitle && c.dealTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'all' || 
        c.status === statusFilter ||
        (statusFilter === 'active' && (c.status === 'Действует' || c.status === 'Исполняется' || c.status === 'Подписан')) ||
        (statusFilter === 'warranty' && (c.status === 'Выполнен (На гарантии)' || c.status === 'Сдан в эксплуатацию'));

      return matchesSearch && matchesStatus;
    });
  }, [currentContracts, searchQuery, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingContractId(null);
    setFormData({
      number: `ДОГ-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900 + 100))}`,
      title: '',
      company: '',
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'Исполняется',
      statusColor: 'blue',
      supportUntil: `${new Date().getDate()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${new Date().getFullYear() + 1}`,
      curator: 'Скобелев Александр Сергеевич',
      curatorPhone: '+7 (937) 984-61-51',
      amount: 'По договору',
      currency: 'RUB',
      scope: '',
      documents: [],
      dealId: '',
      dealTitle: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal (Admin or Authorized)
  const handleOpenEdit = (contract: ProjectContract) => {
    setEditingContractId(contract.id);
    setFormData({
      ...contract,
      currency: contract.currency || 'RUB',
      documents: contract.documents ? [...contract.documents] : []
    });
    setIsModalOpen(true);
  };

  // Deal Selector inside Contract Modal
  const handleDealSelect = (dealId: string) => {
    if (!dealId) {
      setFormData(prev => ({
        ...prev,
        dealId: '',
        dealTitle: ''
      }));
      return;
    }

    const matchedDeal = deals.find(d => d.id === dealId);
    if (matchedDeal) {
      const dealCur = (matchedDeal as any).currency || 'RUB';
      setFormData(prev => ({
        ...prev,
        dealId: matchedDeal.id,
        dealTitle: matchedDeal.serviceType,
        company: prev.company || matchedDeal.companyName,
        title: prev.title || matchedDeal.serviceType,
        currency: prev.currency || dealCur,
        amount: prev.amount && prev.amount !== 'По договору' ? prev.amount : (matchedDeal.estimatedPrice ? `${matchedDeal.estimatedPrice.toLocaleString('ru-RU')} ${getCurrencySymbol(dealCur)}` : 'По договору'),
        curator: prev.curator || matchedDeal.responsibleManager || 'Скобелев Александр Сергеевич'
      }));
    }
  };

  // Add Document to Form
  const handleAddDocument = () => {
    if (!newDocName.trim()) {
      showToast('Введите наименование прикрепляемого файла');
      return;
    }

    const newDoc: AttachedDocument = {
      id: `doc_${Date.now()}`,
      name: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      category: newDocCategory,
      size: newDocSize || '1.2 MB',
      uploadedAt: new Date().toLocaleDateString('ru-RU'),
      uploadedBy: formData.curator || 'Администратор'
    };

    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), newDoc]
    }));

    setNewDocName('');
    setNewDocSize('1.2 MB');
    if (docFileInputRef.current) docFileInputRef.current.value = '';
    showToast(`Документ «${newDoc.name}» прикреплен к договору`);
  };

  const handleRemoveDocument = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== docId)
    }));
  };

  // Save Contract (Add or Update)
  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number?.trim() || !formData.company?.trim() || !formData.title?.trim()) {
      showToast('Заполните обязательные поля: номер, контрагент и предмет договора');
      return;
    }

    const statusVal = formData.status || 'Исполняется';
    let colorVal: ProjectContract['statusColor'] = 'blue';
    if (statusVal === 'Действует') colorVal = 'emerald';
    else if (statusVal === 'Выполнен (На гарантии)') colorVal = 'blue';
    else if (statusVal === 'Сдан в эксплуатацию') colorVal = 'gray';
    else if (statusVal === 'В процессе подписания' || statusVal === 'На согласовании') colorVal = 'amber';
    else if (statusVal === 'Проект') colorVal = 'purple';
    else if (statusVal === 'Приостановлен') colorVal = 'red';

    if (editingContractId) {
      // Update
      const updated: ProjectContract = {
        id: editingContractId,
        number: formData.number.trim(),
        title: formData.title.trim(),
        company: formData.company.trim(),
        date: formData.date || new Date().toLocaleDateString('ru-RU'),
        status: statusVal,
        statusColor: colorVal,
        supportUntil: formData.supportUntil || '',
        curator: formData.curator || 'Скобелев Александр Сергеевич',
        curatorPhone: formData.curatorPhone || '+7 (937) 984-61-51',
        amount: formData.amount || 'По договору',
        currency: formData.currency || 'RUB',
        scope: formData.scope || '',
        documents: formData.documents || [],
        dealId: formData.dealId || undefined,
        dealTitle: formData.dealTitle || undefined
      };

      if (propSetContracts) {
        propSetContracts(prev => prev.map(c => c.id === editingContractId ? updated : c));
      } else {
        updateContract(editingContractId, updated);
      }
      showToast(`Договор ${updated.number} успешно обновлен и синхронизирован`);
    } else {
      // Create new
      const newContract: ProjectContract = {
        id: `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        number: formData.number.trim(),
        title: formData.title.trim(),
        company: formData.company.trim(),
        date: formData.date || new Date().toLocaleDateString('ru-RU'),
        status: statusVal,
        statusColor: colorVal,
        supportUntil: formData.supportUntil || '',
        curator: formData.curator || 'Скобелев Александр Сергеевич',
        curatorPhone: formData.curatorPhone || '+7 (937) 984-61-51',
        amount: formData.amount || 'По договору',
        currency: formData.currency || 'RUB',
        scope: formData.scope || '',
        documents: formData.documents || [],
        dealId: formData.dealId || undefined,
        dealTitle: formData.dealTitle || undefined
      };

      if (propSetContracts) {
        propSetContracts(prev => [newContract, ...prev]);
      } else {
        addContract(newContract);
      }
      showToast(`Договор ${newContract.number} успешно зарегистрирован`);
    }

    setIsModalOpen(false);
  };

  // Delete Contract
  const handleDeleteContract = (id: string) => {
    if (propSetContracts) {
      propSetContracts(prev => prev.filter(c => c.id !== id));
      showToast('Договор удален из базы');
    } else {
      deleteContract(id);
    }
    setDeleteConfirmId(null);
  };

  // Duplicate / Clone Contract in 1 click
  const handleCloneContract = (c: ProjectContract, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const clonedNum = `${c.number}-КОПИЯ`;
    const cloned: ProjectContract = {
      ...c,
      id: `cnt_clone_${Date.now()}`,
      number: clonedNum,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'Проект',
      statusColor: 'purple'
    };
    if (propSetContracts) {
      propSetContracts(prev => [cloned, ...prev]);
    } else {
      addContract(cloned);
    }
    showToast(`Создан проект-дубликат договора «${clonedNum}»`);
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = async () => {
    try {
      const exportRows = filtered.map((c, idx) => ({
        '№ п/п': idx + 1,
        'Номер договора': c.number,
        'Дата заключения': c.date,
        'Контрагент / Заказчик': c.company,
        'Предмет договора / Проект': c.title,
        'Сумма договора': c.amount || 'По договору',
        'Текущий статус': c.status,
        'Ответственный куратор': c.curator,
        'Телефон куратора': c.curatorPhone || '',
        'Срок гарантии / поддержки': c.supportUntil || '—',
        'Связанная сделка CRM': c.dealId ? `${c.dealId} — ${c.dealTitle || ''}` : 'Без привязки',
        'Прикрепленных документов': c.documents?.length || 0,
        'Объем работ и описание': c.scope || ''
      }));

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(exportRows);
      
      const colWidths = [
        { wch: 6 },  // №
        { wch: 18 }, // Номер договора
        { wch: 14 }, // Дата
        { wch: 32 }, // Контрагент
        { wch: 45 }, // Предмет
        { wch: 18 }, // Сумма
        { wch: 22 }, // Статус
        { wch: 28 }, // Куратор
        { wch: 18 }, // Телефон
        { wch: 18 }, // Гарантия
        { wch: 30 }, // Сделка
        { wch: 12 }, // Документы
        { wch: 40 }  // Объем работ
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Реестр Договоров');
      
      const fileName = `Реестр_Договоров_ДС_Инжиниринг_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast('Реестр Договоров успешно экспортирован в Excel (.xlsx)');
      setIsExportMenuOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Ошибка при экспорте реестра договоров в Excel');
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // PDF Export
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      setIsExportMenuOpen(false);
      await exportTableToPdf({
        title: 'Реестр договоров и спецификаций',
        subtitle: 'ООО «ДС-Инжиниринг» • Коммерческий департамент & Юридическая служба',
        department: 'Отдел контрактов и управления проектами',
        filterInfo: searchQuery ? `Поиск: "${searchQuery}"` : statusFilter !== 'all' ? `Фильтр: ${statusFilter}` : 'Все зарегистрированные договоры',
        summaryBadges: [
          { label: 'Всего договоров', value: filtered.length, color: 'blue' },
          { label: 'Действующих', value: filtered.filter(c => c.status === 'Действует' || c.status === 'Исполняется').length, color: 'green' },
          { label: 'На гарантии', value: filtered.filter(c => c.status === 'Выполнен (На гарантии)' || c.status === 'Сдан в эксплуатацию').length, color: 'indigo' }
        ],
        headers: ['№', 'Номер договора', 'Дата', 'Контрагент / Заказчик', 'Предмет договора / Проект', 'Сумма', 'Статус', 'Куратор'],
        rows: filtered.map((c, idx) => [
          String(idx + 1),
          String(c.number || '—'),
          String(c.date || '—'),
          String(c.company || '—'),
          { text: c.title, subtext: c.scope ? c.scope.slice(0, 80) + '...' : undefined },
          String(c.amount ? `${c.amount} ${getCurrencySymbol(c.currency || 'RUB')}` : 'По договору'),
          {
            text: c.status || 'Проект',
            badge: true,
            color: c.status === 'Действует' ? 'emerald' : c.status === 'Исполняется' ? 'blue' : c.status === 'Выполнен (На гарантии)' ? 'indigo' : 'slate'
          },
          String(c.curator || 'Скобелев А.С.')
        ]),
        columnAlignments: ['center', 'center', 'center', 'left', 'left', 'right', 'center', 'left'],
        columnWidths: ['4%', '13%', '9%', '20%', '24%', '11%', '9%', '10%'],
        orientation: 'landscape',
        filename: `Reestr_Dogovorov_DS_Engineering_${new Date().toISOString().slice(0, 10)}.pdf`
      });
      showToast('PDF-отчет по договорам успешно сформирован');
    } catch (err) {
      console.error('Failed to export contracts PDF:', err);
      showToast('Ошибка при формировании PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export to CSV (.csv)
  const handleExportCsv = () => {
    try {
      const headers = [
        '№ п/п',
        'Номер договора',
        'Дата',
        'Контрагент / Заказчик',
        'Предмет договора',
        'Сумма договора',
        'Статус',
        'Ответственный куратор',
        'Телефон куратора',
        'Срок гарантии',
        'Сделка CRM',
        'Объем работ'
      ];

      const rows = filtered.map((c, idx) => [
        idx + 1,
        `"${(c.number || '').replace(/"/g, '""')}"`,
        `"${(c.date || '').replace(/"/g, '""')}"`,
        `"${(c.company || '').replace(/"/g, '""')}"`,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${(c.amount || '').replace(/"/g, '""')}"`,
        `"${(c.status || '').replace(/"/g, '""')}"`,
        `"${(c.curator || '').replace(/"/g, '""')}"`,
        `"${(c.curatorPhone || '').replace(/"/g, '""')}"`,
        `"${(c.supportUntil || '').replace(/"/g, '""')}"`,
        `"${(c.dealId ? `${c.dealId} - ${c.dealTitle || ''}` : '').replace(/"/g, '""')}"`,
        `"${(c.scope || '').replace(/"/g, '""')}"`
      ]);

      const csvString = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Реестр_Договоров_ДС_Инжиниринг_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Реестр Договоров успешно экспортирован в CSV (.csv)');
      setIsExportMenuOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Ошибка при экспорте в CSV');
    }
  };

  // Import Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const newContracts: ProjectContract[] = data.map((row, index) => {
          const status = row['Статус'] || row['Текущий статус'] || 'Исполняется';
          return {
            id: `cnt_import_${Date.now()}_${index}`,
            number: row['Номер договора'] || row['Номер'] || `ДОГ-ИМП-${index + 1}`,
            date: row['Дата заключения'] || row['Дата'] || new Date().toLocaleDateString('ru-RU'),
            company: row['Контрагент / Заказчик'] || row['Контрагент'] || row['Заказчик'] || row['Компания'] || 'Заказчик',
            title: row['Предмет договора / Проект'] || row['Предмет договора'] || row['Предмет'] || row['Проект'] || 'Поставка оборудования и ПО',
            curator: row['Ответственный куратор'] || row['Ответственный менеджер'] || row['Куратор'] || 'Скобелев Александр Сергеевич',
            curatorPhone: row['Телефон куратора'] || '+7 (937) 984-61-51',
            amount: String(row['Сумма договора'] || row['Сумма'] || 'По договору'),
            status: status,
            statusColor: status === 'Действует' ? 'emerald' : (status === 'Выполнен (На гарантии)' ? 'blue' : 'gray'),
            supportUntil: row['Срок гарантии / поддержки'] || row['Срок гарантии'] || '',
            scope: row['Объем работ и описание'] || row['Объем работ'] || row['Примечание'] || '',
            documents: [],
            dealId: row['Сделка'] || row['ID сделки'] || undefined,
            dealTitle: row['Название сделки'] || undefined
          };
        });

        if (newContracts.length > 0) {
          if (propSetContracts) {
            propSetContracts(prev => [...newContracts, ...prev]);
          } else {
            setCurrentContracts(prev => [...newContracts, ...prev]);
          }
          showToast(`Успешно импортировано ${newContracts.length} договоров`);
        } else {
          showToast('Файл пуст или имеет неверный формат');
        }
      } catch (err) {
        showToast('Ошибка при чтении файла');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Реестр договоров и спецификаций
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Управление активными и завершенными договорами, гарантийными обязательствами и документацией.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Импорт договоров из Excel"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Импорт</span>
            </button>
            <button 
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Новый договор</span>
            </button>
          </div>
        </div>
      </div>

      {/* Registry Toolbar */}
      <RegistryToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalCount={filtered.length}
        searchPlaceholder="Поиск по номеру договора, заказчику, предмету, куратору..."
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
      >
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-semibold text-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все договоры ({currentContracts.length})</option>
            <option value="active">Активные и в работе</option>
            <option value="warranty">На гарантийном обслуживании</option>
            <option value="Действует">Статус: Действует</option>
            <option value="Исполняется">Статус: Исполняется</option>
            <option value="Выполнен (На гарантии)">Статус: Выполнен (Гарантия)</option>
            <option value="Сдан в эксплуатацию">Статус: Сдан в эксплуатацию</option>
            <option value="В процессе подписания">Статус: В процессе подписания</option>
          </select>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Экспорт реестра договоров в файл"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Экспорт</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-lg shadow-sm z-30 py-1 overflow-hidden">
                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-2 px-4.5 py-2.5 text-left text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-bold">PDF Отчет (.pdf)</div>
                    <div className="text-[10px] text-gray-400">С печатями и подписью</div>
                  </div>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-2 px-4.5 py-2.5 text-left text-xs font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-colors border-t border-gray-100"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">Excel (.xlsx)</div>
                    <div className="text-[10px] text-gray-400">Форматированный реестр</div>
                  </div>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="w-full flex items-center gap-2 px-4.5 py-2.5 text-left text-xs font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-colors border-t border-gray-100"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-bold">CSV (.csv)</div>
                    <div className="text-[10px] text-gray-400">Таблица с разделителями (UTF-8)</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          {/* Import Button (Hidden Input only) */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
        </div>
      </RegistryToolbar>

      {/* Admin indicator banner */}
      {isAdmin && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50/80 border border-blue-200/60 rounded-lg text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">
              Режим Администратора: данные в реестре договоров синхронизированы с разделом «Договоры и проекты» Личного кабинета.
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-200/70 text-blue-800 rounded-md">
            Сквозная синхронизация
          </span>
        </div>
      )}

      {/* 1. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <HorizontalScrollContainer>
            <table className="w-full data-dense-table text-left text-xs whitespace-nowrap border-collapse min-w-[1000px]">
              <thead className="bg-slate-50/90 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Номер договора</th>
                  <th className="px-4 py-3">Дата</th>
                  <th className="px-4 py-3">Контрагент / Заказчик</th>
                  <th className="px-4 py-3">Предмет договора / Проект</th>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Куратор проекта</th>
                  <th className="px-4 py-3">Файлы</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length > 0 ? filtered.map((c) => {
                  const statusBadge = STATUS_BADGES[c.status] || { label: c.status, color: 'bg-gray-100 text-slate-500 border-gray-200' };

                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => {
                        setViewingContract(c);
                        setIsViewModalOpen(true);
                      }}
                      className="hover:bg-blue-50/60 transition-colors group cursor-pointer"
                    >
                      {/* Contract Number */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{c.number}</span>
                        </div>
                        {c.dealId && (
                          <div className="text-[10px] text-blue-600 font-bold mt-0.5 flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            <span>{c.dealId}</span>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-gray-500 font-medium">
                        {c.date}
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{c.company}</span>
                        </div>
                      </td>

                      {/* Title / Subject */}
                      <td className="px-4 py-3.5 text-gray-800 max-w-xs truncate font-medium" title={c.title}>
                        {c.title}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 font-bold text-gray-900">
                        <span className={c.amount && c.amount !== 'По договору' ? 'text-emerald-700' : 'text-gray-500'}>
                          {c.amount || 'По договору'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Curator */}
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span>{c.curator}</span>
                        </div>
                        <div className="text-gray-400 text-[10px] font-medium">
                          {getStaffMemberInfo(c.curator).position}
                        </div>
                        {c.curatorPhone && (
                          <div className="text-gray-400 flex items-center gap-1 text-[10px] mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{c.curatorPhone}</span>
                          </div>
                        )}
                      </td>

                      {/* Documents count badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (c.documents?.length || 0) > 0 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Paperclip className="w-3 h-3" />
                          <span>{c.documents?.length || 0}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setViewingContract(c);
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Просмотреть карточку договора и файлы"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canEdit && (
                            <button
                              onClick={(e) => handleCloneContract(c, e)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Создать копию / проект-дубликат договора"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title={isAdmin ? "Редактировать договор (права администратора)" : "Редактировать договор"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => setDeleteConfirmId(c.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Удалить договор (права администратора)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <div className="text-sm font-bold text-slate-500">Договоры не найдены</div>
                      <div className="text-xs text-gray-400 mt-1">Попробуйте изменить параметры поиска или добавьте новый договор</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </HorizontalScrollContainer>

          {/* Footer Summary */}
          <div className="px-5 py-3 bg-slate-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
            <div>
              Всего договоров в реестре: <span className="font-bold text-gray-800">{filtered.length}</span> из <span className="font-bold text-gray-800">{currentContracts.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400">
                Синхронизировано с разделом «Договоры и проекты»
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CARDS VIEW */}
      {viewMode === 'cards' && (
        <div>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(c => {
                const statusBadge = STATUS_BADGES[c.status] || { label: c.status, color: 'bg-gray-100 text-slate-500 border-gray-200' };
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setViewingContract(c);
                      setIsViewModalOpen(true);
                    }}
                    className="bg-white rounded-lg p-5 border border-gray-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-mono text-gray-400 font-semibold">{c.date}</div>
                          <div className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{c.number}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-blue-900 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{c.company}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1.5">{c.title}</p>
                      </div>

                      {c.dealId && (
                        <div className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          <span>Сделка: {c.dealId}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-gray-400 font-medium">Сумма</div>
                        <div className="font-bold text-gray-900 text-xs">
                          {c.amount || 'По договору'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setViewingContract(c);
                            setIsViewModalOpen(true);
                          }}
                          className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Открыть</span>
                        </button>
                        {canEdit && (
                          <button
                            onClick={(e) => handleCloneContract(c, e)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Создать проект-дубликат договора"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Редактировать"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-500">Договоры не найдены</div>
              <div className="text-xs text-gray-400 mt-1">Попробуйте изменить параметры поиска или добавьте новый договор</div>
            </div>
          )}
        </div>
      )}

      {/* 3. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xs divide-y divide-gray-100 overflow-hidden">
          {filtered.length > 0 ? filtered.map(c => {
            const statusBadge = STATUS_BADGES[c.status] || { label: c.status, color: 'bg-gray-100 text-slate-500 border-gray-200' };
            return (
              <div
                key={c.id}
                onClick={() => {
                  setViewingContract(c);
                  setIsViewModalOpen(true);
                }}
                className="p-4 hover:bg-blue-50/60 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors">{c.number}</span>
                      <span className="text-[10px] text-gray-400">• {c.date}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      <strong className="text-blue-900">{c.company}</strong> — {c.title}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right">
                    <div className="font-bold text-xs text-gray-900">{c.amount || 'По договору'}</div>
                    <div className="text-[10px] text-gray-400">{c.curator}</div>
                  </div>
                  <button
                    onClick={() => {
                      setViewingContract(c);
                      setIsViewModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center text-gray-500">
              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-500">Договоры не найдены</div>
              <div className="text-xs text-gray-400 mt-1">Попробуйте изменить параметры поиска или добавьте новый договор</div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create / Edit Contract */}
      {isModalOpen && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/75 sm: backdrop-blur-xs overflow-hidden ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}>
          <div className={`${isFullscreen ? 'fixed inset-0 z-[201] w-screen h-screen max-w-none max-h-none rounded-none' : 'relative max-w-3xl w-full h-full max-h-[94vh] sm:max-h-[90vh] rounded-lg sm:rounded-lg'} bg-white shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {editingContractId ? 'Редактирование договора' : 'Регистрация нового договора'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {editingContractId 
                      ? 'Данные будут автоматически обновлены в Реестре Договоров и разделе Проектов' 
                      : 'Заполните параметры договора или выберите сделку CRM для быстрой привязки'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(prev => !prev)}
                  className="p-2 text-gray-400 hover:text-slate-500 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  title={isFullscreen ? "Свернуть в окно" : "На весь экран"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <form id="contract-form" onSubmit={handleSaveContract} className="space-y-4">
                {/* Deal Binding Selector */}
                <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200/80 space-y-2">
                  <label className="block text-xs font-bold text-blue-950 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-600" />
                    Привязать к сделке CRM (опционально)
                  </label>
                  <select
                    value={formData.dealId || ''}
                    onChange={(e) => handleDealSelect(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Без привязки к сделке (независимый контракт) --</option>
                    {deals.map(deal => (
                      <option key={deal.id} value={deal.id}>
                        [{deal.id}] {deal.companyName} — {deal.serviceType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Data: Number, Date, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Номер договора <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={formData.number || ''} 
                      onChange={e => setFormData({ ...formData, number: e.target.value })} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold text-gray-900" 
                      placeholder="ДОГ-2026/..." 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Дата заключения <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={formData.date || new Date().toLocaleDateString('ru-RU')} 
                      onChange={e => setFormData({ ...formData, date: e.target.value })} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-gray-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Статус договора <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.status || 'Исполняется'} 
                      onChange={e => setFormData({ ...formData, status: e.target.value })} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-gray-900"
                    >
                      <option value="Исполняется">Исполняется</option>
                      <option value="Действует">Действует</option>
                      <option value="Выполнен (На гарантии)">Выполнен (На гарантии)</option>
                      <option value="Сдан в эксплуатацию">Сдан в эксплуатацию</option>
                      <option value="Подписан">Подписан</option>
                      <option value="В процессе подписания">В процессе подписания</option>
                      <option value="На согласовании">На согласовании</option>
                      <option value="Проект">Проект</option>
                      <option value="Приостановлен">Приостановлен</option>
                      <option value="Завершен">Завершен</option>
                      <option value="Расторгнут">Расторгнут</option>
                    </select>
                  </div>
                </div>

                {/* Company & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center justify-between">
                      <span>Контрагент / Заказчик <span className="text-red-500">*</span></span>
                      <button 
                        type="button" 
                        onClick={() => setIsCompModalOpen(true)}
                        className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        Новый
                      </button>
                    </label>
                    <select 
                      required 
                      value={crmCompanies.some(c => c.name === formData.company) ? formData.company : ''} 
                      onChange={e => setFormData({ ...formData, company: e.target.value })} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold text-blue-900" 
                    >
                      <option value="" disabled>{formData.company && !crmCompanies.some(c => c.name === formData.company) ? formData.company : 'Выберите из базы...'}</option>
                      {crmCompanies.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center justify-between">
                      <span>Сумма договора (с НДС 22%)</span>
                      <span className="text-[10px] text-gray-500 font-normal">Валюта:</span>
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formData.amount || ''} 
                        onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold text-emerald-800" 
                        placeholder="Например, 4 850 000 или «По договору»" 
                      />
                      <select
                        value={formData.currency || 'RUB'}
                        onChange={e => setFormData({ ...formData, currency: e.target.value as CurrencyCode })}
                        className="px-2.5 py-2 border border-gray-300 rounded-lg bg-gray-50 font-bold text-xs text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none shrink-0"
                        title="Выбор валюты договора"
                      >
                        <option value="RUB">₽ RUB (Рубли)</option>
                        <option value="USD">$ USD (Доллар США)</option>
                        <option value="EUR">€ EUR (Евро)</option>
                        <option value="CNY">¥ CNY (Юани)</option>
                      </select>
                    </div>

                    {/* 3-point VAT breakdown preview if numeric */}
                    {(() => {
                      const num = parseInt((formData.amount || '').replace(/\D/g, ''), 10);
                      if (!num || isNaN(num) || num <= 0) return null;
                      const sym = getCurrencySymbol(formData.currency || 'RUB');
                      const withoutVat = Math.round(num / 1.22);
                      const vat = Math.round(withoutVat * 0.22);
                      return (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                          <div className="flex justify-between text-slate-500">
                            <span>ИТОГО без НДС:</span>
                            <span className="font-mono font-bold text-gray-800">
                              {withoutVat.toLocaleString('ru-RU')} {sym}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>В том числе НДС 22%:</span>
                            <span className="font-mono font-bold text-blue-600">
                              {vat.toLocaleString('ru-RU')} {sym}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-gray-900 border-t border-slate-200 pt-1">
                            <span>ИТОГО с учетом НДС 22%:</span>
                            <span className="font-mono font-black text-emerald-800">
                              {num.toLocaleString('ru-RU')} {sym}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Предмет договора / Наименование проекта <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={formData.title || ''} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-gray-900" 
                    placeholder="Внедрение TopSolid 7 + 2 лицензии TopSolid'CAM 7 + PDM" 
                  />
                </div>

                {/* Curator & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Ответственный куратор (ДС‑Инжиниринг)
                    </label>
                    <select
                      value={formData.curator || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        const staff = getStaffMemberInfo(val);
                        setFormData({ 
                          ...formData, 
                          curator: val,
                          curatorPhone: staff.phone || formData.curatorPhone 
                        });
                      }} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium text-gray-900"
                    >
                      <option value="" disabled>Выберите куратора...</option>
                      {authUsers
                        .filter(u => u.role === 'superadmin' || u.role === 'admin' || u.role === 'manager')
                        .map(u => {
                          const staff = getStaffMemberInfo(u.fullName);
                          return (
                            <option key={u.id} value={staff.fullName}>
                              {staff.fullName} — {staff.position}
                            </option>
                          );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Телефон куратора
                    </label>
                    <input 
                      type="text" 
                      value={formData.curatorPhone || ''} 
                      onChange={e => setFormData({ ...formData, curatorPhone: e.target.value })} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs text-gray-900" 
                      placeholder="+7 (937) 984-61-51" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Срок гарантии / техподдержки
                    </label>
                    <input 
                      type="text" 
                      value={formData.supportUntil || ''} 
                      onChange={e => setFormData({ ...formData, supportUntil: e.target.value })} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs text-gray-900" 
                      placeholder="Например, 15.01.2027" 
                    />
                  </div>
                </div>

                {/* Scope */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Объем работ, спецификация и примечания
                  </label>
                  <textarea 
                    value={formData.scope || ''} 
                    onChange={e => setFormData({ ...formData, scope: e.target.value })} 
                    rows={2} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs text-gray-800" 
                    placeholder="Поставка лицензий, развертывание PDM-хранилища, разработка постпроцессоров..." 
                  />
                </div>

                {/* Attached Documents Section */}
                <div className="p-4 rounded-lg bg-slate-50 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      Прикрепленные документы ({formData.documents?.length || 0})
                    </span>
                  </div>

                  {/* Documents List */}
                  {formData.documents && formData.documents.length > 0 ? (
                    <div className="space-y-2">
                      {formData.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <div className="truncate">
                              <div className="font-bold text-gray-800 truncate">{doc.name}</div>
                              <div className="text-[10px] text-gray-400">{doc.category} • {doc.size}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Удалить файл"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-400 italic">
                      Нет прикрепленных файлов. Вы можете добавить документы ниже:
                    </div>
                  )}

                  {/* Add Document Row */}
                  <div className="pt-2 border-t border-gray-200/70 grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6 relative">
                      <input
                        type="file"
                        ref={docFileInputRef}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewDocName(file.name);
                            setNewDocSize((file.size / 1024 / 1024).toFixed(1) + ' MB');
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                      />
                      <div className="w-full px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-xs flex items-center justify-between text-gray-500 hover:border-blue-400 transition-colors pointer-events-none">
                        <span className="truncate">{newDocName || 'Выберите файл...'}</span>
                        <Upload className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                    <select
                      value={newDocCategory}
                      onChange={e => setNewDocCategory(e.target.value as any)}
                      className="sm:col-span-4 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    >
                      <option value="Договор и приложения">Договор и приложения</option>
                      <option value="Спецификация и смета">Спецификация и смета</option>
                      <option value="Акт сдачи-приемки">Акт сдачи-приемки</option>
                      <option value="Паспорт и сертификат">Паспорт и сертификат</option>
                      <option value="Счет и закрывающие">Счет и закрывающие</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddDocument}
                      className="sm:col-span-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Прикрепить
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {isAdmin && <span className="font-semibold text-blue-700">Режим Администратора активен</span>}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-gray-900 bg-white border border-gray-300 rounded-lg transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button 
                  form="contract-form" 
                  type="submit" 
                  className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingContractId ? 'Сохранить изменения' : 'Зарегистрировать договор'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Contract Details */}
      {isViewModalOpen && viewingContract && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/75 sm: backdrop-blur-xs overflow-hidden ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}>
          <div className={`${isFullscreen ? 'fixed inset-0 z-[201] w-screen h-screen max-w-none max-h-none rounded-none' : 'relative max-w-2xl w-full h-full max-h-[94vh] sm:max-h-[90vh] rounded-lg sm:rounded-lg'} bg-white shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-blue-700 text-white shrink-0">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-base">{viewingContract.number}</h3>
                  <p className="text-xs text-blue-100">{viewingContract.date} • {viewingContract.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(prev => !prev)}
                  className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title={isFullscreen ? "Свернуть в окно" : "На весь экран"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsViewModalOpen(false)} 
                  className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-gray-200 space-y-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Предмет договора / Проект</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{viewingContract.title}</div>
                </div>

                <div className="pt-2 border-t border-gray-200 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 font-semibold">Текущий статус:</span>
                    <span className="font-bold text-blue-800">{viewingContract.status}</span>
                  </div>

                  {(() => {
                    const num = parseInt((viewingContract.amount || '').replace(/\D/g, ''), 10);
                    const sym = getCurrencySymbol(viewingContract.currency || 'RUB');
                    if (num && !isNaN(num) && num > 0) {
                      const withoutVat = Math.round(num / 1.22);
                      const vat = Math.round(withoutVat * 0.22);
                      return (
                        <div className="p-3 bg-white rounded-lg border border-gray-200/80 space-y-1.5 mt-2">
                          <div className="flex items-center justify-between text-slate-500">
                            <span>ИТОГО без НДС:</span>
                            <span className="font-mono font-bold text-gray-800">{withoutVat.toLocaleString('ru-RU')} {sym}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500">
                            <span>В том числе НДС 22%:</span>
                            <span className="font-mono font-bold text-blue-600">{vat.toLocaleString('ru-RU')} {sym}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-200 font-black text-gray-900">
                            <span className="uppercase text-[11px] tracking-wide">ИТОГО с учетом НДС 22%:</span>
                            <span className="text-sm font-black text-emerald-800 font-mono">{num.toLocaleString('ru-RU')} {sym}</span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-semibold">Сумма договора:</span>
                        <span className="font-bold text-emerald-700">{viewingContract.amount || 'По договору'}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-gray-200">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Ответственный куратор</div>
                  <div className="font-bold text-gray-800 mt-0.5">{viewingContract.curator}</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    {getStaffMemberInfo(viewingContract.curator).position}
                  </div>
                  {viewingContract.curatorPhone && (
                    <div className="text-gray-500 text-[11px] mt-0.5">{viewingContract.curatorPhone}</div>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-gray-200">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Срок гарантии / поддержки</div>
                  <div className="font-bold text-blue-700 mt-0.5">
                    {viewingContract.supportUntil || 'Не указан'}
                  </div>
                </div>
              </div>

              
              {/* Connected Licenses and Tickets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {/* Licenses */}
                <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/30">
                  <h4 className="text-xs font-bold text-blue-900 uppercase mb-3 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Выданные лицензии ({licenses.filter(l => l.contractId === viewingContract.id).length})
                  </h4>
                  <div className="space-y-2">
                    {licenses.filter(l => l.contractId === viewingContract.id).map(lic => (
                      <div key={lic.id} className="p-2.5 bg-white border border-blue-100 rounded-lg text-xs">
                        <div className="font-bold text-gray-800">{lic.title}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{lic.type} • {lic.seatsCount}</div>
                        <div className="mt-1.5 inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                          {lic.status}
                        </div>
                      </div>
                    ))}
                    {licenses.filter(l => l.contractId === viewingContract.id).length === 0 && (
                      <div className="text-[11px] text-gray-400 italic">Нет привязанных лицензий</div>
                    )}
                  </div>
                </div>

                {/* Support Tickets */}
                <div className="p-4 rounded-lg border border-amber-100 bg-amber-50/30">
                  <h4 className="text-xs font-bold text-amber-900 uppercase mb-3 flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5" />
                    Заявки в техподдержку ({supportTickets.filter(t => t.contractId === viewingContract.id).length})
                  </h4>
                  <div className="space-y-2">
                    {supportTickets.filter(t => t.contractId === viewingContract.id).map(ticket => (
                      <div key={ticket.id} className="p-2.5 bg-white border border-amber-100 rounded-lg text-xs">
                        <div className="font-bold text-gray-800">{ticket.subject}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{ticket.id} • {ticket.date}</div>
                        <div className="mt-1.5 inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">
                          {ticket.status === 'open' ? 'Открыта' : ticket.status === 'resolved' ? 'Решена' : 'В работе'}
                        </div>
                      </div>
                    ))}
                    {supportTickets.filter(t => t.contractId === viewingContract.id).length === 0 && (
                      <div className="text-[11px] text-gray-400 italic">Нет обращений по договору</div>
                    )}
                  </div>
                </div>
              </div>


              {viewingContract.scope && (
                <div className="p-3 rounded-lg bg-slate-50 border border-gray-200">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Объем работ и комплектация</div>
                  <div className="text-gray-800 mt-1 leading-relaxed">{viewingContract.scope}</div>
                </div>
              )}

              {/* Documents */}
              <div className="space-y-2">
                <div className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                  Прикрепленные файлы ({viewingContract.documents?.length || 0})
                </div>

                {viewingContract.documents && viewingContract.documents.length > 0 ? (
                  <div className="space-y-1.5">
                    {viewingContract.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-gray-100 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-bold text-gray-800">{doc.name}</div>
                            <div className="text-[10px] text-gray-400">{doc.category} • {doc.size}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">
                          Доступен
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 italic">Нет прикрепленных файлов</div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleOpenEdit(viewingContract);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-gray-100 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Редактировать</span>
                  </button>
                )}
                {canEdit && viewingContract && (
                  <button
                    onClick={() => {
                      handleCloneContract(viewingContract);
                      setIsViewModalOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Дублировать</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="ml-auto px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete */}
      {deleteConfirmId && (
        <div className={`fixed inset-0 z-[250] flex items-center justify-center bg-black/75 backdrop-blur-xs overflow-hidden ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}>
          <div className="bg-white rounded-lg sm:rounded-lg w-full max-w-md p-6 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Удалить договор из базы?</h3>
              <p className="text-xs text-gray-500">
                Это действие удалит запись о договоре и проекте. Данные нельзя будет восстановить.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteContract(deleteConfirmId)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer shadow-sm"
              >
                Удалить договор
              </button>
            </div>
          </div>
        </div>
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
                if (res.data && res.data.name) {
                   setFormData(prev => ({ ...prev, company: res.data.name }));
                }
              }
              setIsCompModalOpen(false);
              showToast('Предприятие успешно добавлено в базу!');
            } else {
              showToast('Ошибка при добавлении предприятия');
            }
          }}
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
              }
              setIsContModalOpen(false);
              showToast('Контакт успешно добавлен в базу!');
            } else {
              showToast('Ошибка при добавлении контакта');
            }
          }}
          companies={crmCompanies}
          initialCompanyId={crmCompanies.find(c => c.name === formData.company)?.id}
        />
      )}
    </div>
  );
};
