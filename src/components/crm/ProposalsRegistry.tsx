import React, { useState, useRef, useMemo } from 'react';
import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';

import { Maximize2, Minimize2,  
  Search, 
  Plus, 
  Upload, 
  Download, 
  FileText, 
  Check, 
  X, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  Link2, 
  Building2, 
  User, 
  Phone, 
  FileSpreadsheet, 
  FileCheck, 
  Briefcase,
  Shield,
  Layers,
  ChevronDown,
  Paperclip,
  CheckCircle2,
  Printer,
  Clock,
  ArrowRight,
  Filter,
  Copy,
  CheckSquare,
  Square,
  Wand2
} from 'lucide-react';
import { CommercialProposal, ProposalVersion, CrmCompany, CrmContact, CurrencyCode, getCurrencySymbol, ProjectContract } from '../../types';
import { CrmDeal, INITIAL_CRM_DEALS } from '../../data/mockCrmData';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { ProposalDocumentViewerModal } from './ProposalDocumentViewerModal';
import { TkpTzGeneratorView } from './TkpTzGeneratorView';
import { ProposalQuickSlideOver } from './ProposalQuickSlideOver';
import { CrmBatchActionBar } from './CrmBatchActionBar';
import { getStaffMemberInfo } from '../../utils/staffDirectory';
import { CompanyModal } from './CompanyModal';
import { ContactModal } from './ContactModal';
import { exportTableToPdf } from '../../utils/exportTablePdf';
import { downloadProposalPdf } from '../../utils/printProposal';

interface ProposalsRegistryProps {
  proposals?: CommercialProposal[];
  setProposals?: React.Dispatch<React.SetStateAction<CommercialProposal[]>>;
  deals?: CrmDeal[];
  onOpenTkpTzGenerator?: () => void;
}

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  inquiry: { label: 'Новый лид / Запрос', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  tz_prep: { label: 'Подготовка ТЗ', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  nda: { label: 'NDA / Согласование', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  calc: { label: 'Расчет трудоемкости', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  kp_sent: { label: 'КП выставлено', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  audit: { label: 'Технический аудит', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  demo: { label: 'Демонстрация / Тест', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  contract: { label: 'Договор / Спецификация', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  prepayment: { label: 'Ожидание аванса', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  implementation: { label: 'Внедрение / Исполнение', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  maintenance: { label: 'Сервис и калибровка', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  won: { label: 'Успешно реализовано', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  closed_won: { label: 'Контракт заключен', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  lost: { label: 'Отказ / Архив', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const FUNNEL_LABELS: Record<string, { label: string; icon: string }> = {
  equipment: { label: 'Оборудование и ПО', icon: '🏭' },
  services: { label: '3D-услуги и сканирование', icon: '📐' },
  support: { label: 'Сервис и ТО КИМ', icon: '🛠️' }
};

export const ProposalsRegistry: React.FC<ProposalsRegistryProps> = ({ 
  proposals: propProposals, 
  setProposals: propSetProposals,
  deals: propDeals
}) => {
  const { 
    commercialProposals, 
    setCommercialProposals, 
    addCommercialProposal, 
    updateCommercialProposal, 
    deleteCommercialProposal,
    contracts,
    setContracts,
    addContract,
    showToast,
    isAdmin,
    userPermissions,
    authUsers,
    deals: contextDeals,
    currentUser
  } = useApp();

  // Use props if passed, otherwise fall back to AppContext or default mock data
  const currentProposals = propProposals || commercialProposals;
  const setCurrentProposals = propSetProposals || setCommercialProposals;

  // Batch Operations State
  const [selectedProposalIds, setSelectedProposalIds] = useState<Set<string>>(new Set());

  // Slide-over Quick Drawer State
  const [slideOverProposal, setSlideOverProposal] = useState<CommercialProposal | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  // Guarantee deals availability: prop -> context -> INITIAL_CRM_DEALS
  const effectiveDeals = useMemo(() => {
    if (propDeals && propDeals.length > 0) return propDeals;
    if (contextDeals && contextDeals.length > 0) return contextDeals;
    return INITIAL_CRM_DEALS;
  }, [propDeals, contextDeals]);

  const canEdit = isAdmin || userPermissions?.canEditDeals || userPermissions?.canManageContracts;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list' | 'compact'>('table');
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [selectedFunnelFilter, setSelectedFunnelFilter] = useState<string>('all');
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

  // Document Viewer Modal States
  const [viewingDocProposal, setViewingDocProposal] = useState<CommercialProposal | null>(null);
  const [viewingDocVersion, setViewingDocVersion] = useState<ProposalVersion | undefined>(undefined);

  // Unified Interactive TKP & TZ Generator / Editor State
  const [isUnifiedGeneratorOpen, setIsUnifiedGeneratorOpen] = useState(false);
  const [activeGeneratorProposalId, setActiveGeneratorProposalId] = useState<string | undefined>(undefined);
  const [activeGeneratorDealId, setActiveGeneratorDealId] = useState<string | undefined>(undefined);

  // Version attachment upload state
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionSize, setNewVersionSize] = useState('1.5 MB');
  const [newVersionDataUrl, setNewVersionDataUrl] = useState<string | undefined>(undefined);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deal modal search state
  const [modalDealSearch, setModalDealSearch] = useState('');

  const [formData, setFormData] = useState<Partial<CommercialProposal>>({
    outgoingNumber: '',
    date: new Date().toLocaleDateString('ru-RU'),
    toCompany: '',
    content: '',
    preparedBy: 'Скобелев А.С.',
    note: '',
    internalNotes: '',
    contactPerson: '',
    contactPhone: '',
    dealId: '',
    dealTitle: '',
    dealStage: '',
    dealFunnel: 'equipment',
    amount: undefined,
    currency: 'RUB',
    versions: [],
    isAlternative: false,
    akpPurpose: 'partner_tender'
  });

  // Filter counters
  const countAll = currentProposals.length;
  const countStandard = currentProposals.filter(p => !p.isAlternative).length;
  const countAkp = currentProposals.filter(p => p.isAlternative).length;
  const countPartnerAkp = currentProposals.filter(p => p.isAlternative && (p.akpPurpose === 'partner_tender' || !p.akpPurpose)).length;
  const countSupplyAkp = currentProposals.filter(p => p.isAlternative && p.akpPurpose === 'alternative_supply').length;

  // Filter proposals for table
  const filtered = useMemo(() => {
    return currentProposals.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        p.outgoingNumber.toLowerCase().includes(q) ||
        p.toCompany.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.preparedBy && p.preparedBy.toLowerCase().includes(q)) ||
        (p.dealId && p.dealId.toLowerCase().includes(q)) ||
        (p.dealTitle && p.dealTitle.toLowerCase().includes(q)) ||
        (p.isAlternative && 'акп альтернативное тендер партнер поставка'.includes(q));

      const isPartner = p.isAlternative && (p.akpPurpose === 'partner_tender' || !p.akpPurpose);
      const isSupply = p.isAlternative && p.akpPurpose === 'alternative_supply';

      const matchesFunnel = 
        selectedFunnelFilter === 'all' || 
        (selectedFunnelFilter === 'akp' && Boolean(p.isAlternative)) ||
        (selectedFunnelFilter === 'akp_partner' && isPartner) ||
        (selectedFunnelFilter === 'akp_supply' && isSupply) ||
        (selectedFunnelFilter === 'standard' && !p.isAlternative) ||
        (selectedFunnelFilter === 'linked' && Boolean(p.dealId)) ||
        (selectedFunnelFilter === 'unlinked' && !p.dealId) ||
        p.dealFunnel === selectedFunnelFilter;

      return matchesSearch && matchesFunnel;
    });
  }, [currentProposals, searchQuery, selectedFunnelFilter]);

  // Batch Selection helpers
  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selectedProposalIds.has(p.id));
  const someFilteredSelected = filtered.some(p => selectedProposalIds.has(p.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedProposalIds(new Set());
    } else {
      const newSet = new Set(selectedProposalIds);
      filtered.forEach(p => newSet.add(p.id));
      setSelectedProposalIds(newSet);
    }
  };

  const handleToggleSelectOne = (id: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setSelectedProposalIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedProposalIds(new Set());
  };

  // Selected proposals array and sum
  const selectedProposals = useMemo(() => {
    return currentProposals.filter(p => selectedProposalIds.has(p.id));
  }, [currentProposals, selectedProposalIds]);

  const selectedTotalSum = useMemo(() => {
    return selectedProposals.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [selectedProposals]);

  // Bulk Reassign Manager
  const handleBatchReassignManager = (managerName: string) => {
    if (selectedProposalIds.size === 0) return;
    const updated = currentProposals.map(p => {
      if (selectedProposalIds.has(p.id)) {
        return { ...p, preparedBy: managerName };
      }
      return p;
    });
    if (propSetProposals) propSetProposals(updated);
    else setCommercialProposals(updated);
    showToast(`Ответственный «${managerName}» успешно назначен для ${selectedProposalIds.size} КП`);
    setSelectedProposalIds(new Set());
  };

  // Bulk Change Funnel / Type
  const handleBatchChangeFunnel = (funnelOrType: string) => {
    if (selectedProposalIds.size === 0) return;
    const updated = currentProposals.map(p => {
      if (selectedProposalIds.has(p.id)) {
        if (funnelOrType === 'akp_partner') {
          return { ...p, isAlternative: true, akpPurpose: 'partner_tender' as const };
        } else if (funnelOrType === 'akp_supply') {
          return { ...p, isAlternative: true, akpPurpose: 'alternative_supply' as const };
        } else if (funnelOrType === 'standard') {
          return { ...p, isAlternative: false };
        } else {
          return { ...p, dealFunnel: funnelOrType };
        }
      }
      return p;
    });
    if (propSetProposals) propSetProposals(updated);
    else setCommercialProposals(updated);
    showToast(`Параметры успешно обновлены для ${selectedProposalIds.size} КП`);
    setSelectedProposalIds(new Set());
  };

  // Bulk Delete
  const handleBatchDelete = () => {
    if (!isAdmin) return;
    const count = selectedProposalIds.size;
    const updated = currentProposals.filter(p => !selectedProposalIds.has(p.id));
    if (propSetProposals) propSetProposals(updated);
    else setCommercialProposals(updated);
    showToast(`Удалено ${count} коммерческих предложений`);
    setSelectedProposalIds(new Set());
  };

  // Create Contract seamlessly from Proposal
  const handleCreateContractFromProposal = (cp: CommercialProposal) => {
    const rawNumberPart = cp.outgoingNumber.replace(/[^0-9]/g, '').slice(-3) || String(Math.floor(Math.random() * 900 + 100));
    const defaultContractNum = `ДОГ-${new Date().getFullYear()}/${rawNumberPart}`;
    const newContract: ProjectContract = {
      id: `cont_${Date.now()}`,
      number: defaultContractNum,
      title: cp.content ? `Договор поставки: ${cp.content}` : `Комплексная поставка измерительного оборудования и ПО`,
      company: cp.toCompany,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'Исполняется',
      statusColor: 'blue',
      supportUntil: `${new Date().getDate()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${new Date().getFullYear() + 1}`,
      curator: cp.preparedBy || 'Скобелев Александр Сергеевич',
      curatorPhone: cp.contactPhone || '+7 (937) 984-61-51',
      amount: cp.amount ? `${cp.amount.toLocaleString('ru-RU')} ₽` : 'По расчету',
      currency: cp.currency || 'RUB',
      vatRate: cp.vatRate ?? 22,
      vatMode: cp.vatMode || 'standard',
      vatIncluded: true,
      scope: cp.content || 'Поставка измерительного оборудования, пусконаладка, поверка СИ во ФГИС АРШИН и обучение специалистов',
      documents: cp.versions?.map((v, i) => ({
        id: `doc_${Date.now()}_${i}`,
        name: v.name,
        category: 'Договор и приложения',
        size: v.size,
        uploadedAt: v.uploadedAt,
        uploadedBy: v.uploadedBy
      })) || [],
      dealId: cp.dealId,
      dealTitle: cp.dealTitle
    };

    if (addContract) {
      addContract(newContract);
    } else if (setContracts) {
      setContracts(prev => [newContract, ...prev]);
    }

    showToast(`Проект Договора «${defaultContractNum}» для «${cp.toCompany}» успешно создан!`);
    setIsSlideOverOpen(false);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setActiveGeneratorProposalId(undefined);
    setActiveGeneratorDealId(undefined);
    setIsUnifiedGeneratorOpen(true);
  };

  // Add Version to Form
  const handleAddVersion = () => {
    if (!newVersionName.trim()) {
      showToast('Введите наименование прикрепляемого файла');
      return;
    }

    const currentVersions = formData.versions || [];
    const nextVersionNum = currentVersions.length + 1;

    const newVersion: ProposalVersion = {
      id: `ver_${Date.now()}`,
      version: nextVersionNum,
      name: newVersionName.trim().endsWith('.pdf') ? newVersionName.trim() : `${newVersionName.trim()}.pdf`,
      size: newVersionSize || '1.2 MB',
      uploadedAt: new Date().toLocaleDateString('ru-RU'),
      uploadedBy: formData.preparedBy || 'Скобелев А.С.',
      fileDataUrl: newVersionDataUrl
    };

    setFormData(prev => ({
      ...prev,
      versions: [...(prev.versions || []), newVersion]
    }));

    setNewVersionName('');
    setNewVersionSize('1.2 MB');
    setNewVersionDataUrl(undefined);
    if (docFileInputRef.current) docFileInputRef.current.value = '';
    showToast(`Файл «${newVersion.name}» добавлен к КП`);
  };

  const handleRemoveVersion = (verId: string) => {
    setFormData(prev => ({
      ...prev,
      versions: (prev.versions || []).filter(v => v.id !== verId)
    }));
  };

  // Clone Proposal in 1 click
  const handleCloneProposal = (cp: CommercialProposal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const count = currentProposals.length + 1;
    const clonedNum = `${cp.outgoingNumber}-КОПИЯ`;
    const cloned: CommercialProposal = {
      ...cp,
      id: `cp_clone_${Date.now()}`,
      outgoingNumber: clonedNum,
      date: new Date().toLocaleDateString('ru-RU'),
      note: `${cp.note || ''} (Дубликат от ${new Date().toLocaleDateString('ru-RU')})`.trim()
    };
    addCommercialProposal(cloned);
    showToast(`Создан дубликат предложения «${clonedNum}»`);
  };

  // Open Edit in Unified Studio Editor (Admin or authorized manager)
  const handleOpenEdit = (proposal: CommercialProposal) => {
    setActiveGeneratorProposalId(proposal.id);
    setActiveGeneratorDealId(proposal.dealId);
    setIsUnifiedGeneratorOpen(true);
  };

  // Handle Deal selection in Modal (Autofills information)
  const handleDealSelect = (dealId: string) => {
    if (!dealId) {
      setFormData(prev => ({
        ...prev,
        dealId: '',
        dealTitle: '',
        dealStage: ''
      }));
      return;
    }

    const matchedDeal = effectiveDeals.find(d => d.id === dealId);
    if (matchedDeal) {
      setFormData(prev => ({
        ...prev,
        dealId: matchedDeal.id,
        dealTitle: matchedDeal.serviceType,
        dealStage: matchedDeal.stage,
        dealFunnel: matchedDeal.funnel || prev.dealFunnel || 'equipment',
        toCompany: prev.toCompany || matchedDeal.companyName,
        contactPerson: prev.contactPerson || matchedDeal.customerName,
        contactPhone: prev.contactPhone || matchedDeal.phone,
        content: prev.content || `${matchedDeal.serviceType} (согласно спецификации сделки ${matchedDeal.id})`,
        preparedBy: prev.preparedBy || matchedDeal.responsibleManager || 'Скобелев А.С.',
        amount: prev.amount !== undefined && prev.amount > 0 ? prev.amount : (matchedDeal.estimatedPrice || undefined),
        currency: prev.currency || (matchedDeal as any).currency || 'RUB'
      }));
      showToast(`Привязано к сделке ${matchedDeal.id}: данные контрагента заполнены`);
    }
  };

  // Save Proposal (Add or Update)
  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.outgoingNumber?.trim() || !formData.toCompany?.trim()) {
      showToast('Заполните обязательные поля: номер КП и наименование компании');
      return;
    }

    const isAkp = Boolean(formData.isAlternative);
    const akpPurpose = isAkp ? (formData.akpPurpose || 'partner_tender') : undefined;

    if (editingProposalId) {
      // Update existing
      const updated: CommercialProposal = {
        id: editingProposalId,
        outgoingNumber: formData.outgoingNumber.trim(),
        date: formData.date || new Date().toLocaleDateString('ru-RU'),
        toCompany: formData.toCompany.trim(),
        content: formData.content || '',
        preparedBy: formData.preparedBy || 'Скобелев А.С.',
        note: formData.note || '',
        internalNotes: formData.internalNotes || '',
        contactPerson: formData.contactPerson || '',
        contactPhone: formData.contactPhone || '',
        dealId: formData.dealId || undefined,
        dealTitle: formData.dealTitle || undefined,
        dealStage: formData.dealStage || undefined,
        dealFunnel: formData.dealFunnel || undefined,
        amount: formData.amount ? Number(formData.amount) : undefined,
        currency: formData.currency || 'RUB',
        versions: formData.versions || [],
        isAlternative: isAkp,
        akpPurpose: akpPurpose
      };

      if (propSetProposals) {
        propSetProposals(prev => prev.map(p => p.id === editingProposalId ? updated : p));
      } else {
        updateCommercialProposal(editingProposalId, updated);
      }
      showToast(`КП ${updated.outgoingNumber} ${isAkp ? (akpPurpose === 'partner_tender' ? '(АКП Партнерам) ' : '(АКП Поставка) ') : ''}успешно обновлено`);
    } else {
      // Add new
      const newCp: CommercialProposal = {
        id: `cp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        outgoingNumber: formData.outgoingNumber.trim(),
        date: formData.date || new Date().toLocaleDateString('ru-RU'),
        toCompany: formData.toCompany.trim(),
        content: formData.content || '',
        preparedBy: formData.preparedBy || 'Скобелев А.С.',
        note: formData.note || '',
        internalNotes: formData.internalNotes || '',
        contactPerson: formData.contactPerson || '',
        contactPhone: formData.contactPhone || '',
        dealId: formData.dealId || undefined,
        dealTitle: formData.dealTitle || undefined,
        dealStage: formData.dealStage || undefined,
        dealFunnel: formData.dealFunnel || undefined,
        amount: formData.amount ? Number(formData.amount) : undefined,
        currency: formData.currency || 'RUB',
        versions: formData.versions || [],
        isAlternative: isAkp,
        akpPurpose: akpPurpose
      };

      if (propSetProposals) {
        propSetProposals(prev => [newCp, ...prev]);
      } else {
        addCommercialProposal(newCp);
      }
      showToast(`КП ${newCp.outgoingNumber} ${isAkp ? (akpPurpose === 'partner_tender' ? '(АКП Партнерам) ' : '(АКП Поставка) ') : ''}успешно зарегистрировано`);
    }
  };

  // Delete Proposal
  const handleDeleteProposal = (id: string) => {
    if (propSetProposals) {
      propSetProposals(prev => prev.filter(p => p.id !== id));
    } else {
      deleteCommercialProposal(id);
    }
    showToast('Коммерческое предложение удалено из базы');
    setDeleteConfirmId(null);
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = async (onlySelected: boolean = false) => {
    try {
      const sourceList = (onlySelected && selectedProposalIds.size > 0) ? selectedProposals : filtered;
      const exportRows = sourceList.map((cp, idx) => ({
        '№ п/п': idx + 1,
        'Исходящий номер КП': cp.outgoingNumber,
        'Тип КП': cp.isAlternative 
          ? (cp.akpPurpose === 'partner_tender' || !cp.akpPurpose ? 'АКП (Для партнеров / тендер)' : 'АКП (Альтернативная поставка)')
          : 'Основное КП',
        'Дата': cp.date,
        'Контрагент (Кому)': cp.toCompany,
        'Содержание': cp.content,
        'Воронка CRM': cp.dealFunnel ? (FUNNEL_LABELS[cp.dealFunnel]?.label || cp.dealFunnel) : '—',
        'Привязанная сделка CRM': cp.dealId ? `${cp.dealId} — ${cp.dealTitle || ''}` : 'Без привязки',
        'Этап сделки': cp.dealStage ? (STAGE_LABELS[cp.dealStage]?.label || cp.dealStage) : '—',
        'Сумма КП (₽)': cp.amount || 0,
        'Файлы': cp.versions && cp.versions.length > 0 ? `${cp.versions.length} файл(ов)` : 'Нет',
        'Кто готовил': cp.preparedBy,
        'Контактное лицо': cp.contactPerson || '—',
        'Телефон': cp.contactPhone || '—',
        'Примечание': cp.note || '—',
        'Внутренние заметки': cp.internalNotes || '—'
      }));

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(exportRows);
      
      const colWidths = [
        { wch: 6 },  // №
        { wch: 22 }, // Номер КП
        { wch: 28 }, // Тип КП
        { wch: 12 }, // Дата
        { wch: 32 }, // Контрагент
        { wch: 45 }, // Содержание
        { wch: 22 }, // Воронка
        { wch: 30 }, // Сделка
        { wch: 24 }, // Этап
        { wch: 16 }, // Сумма
        { wch: 14 }, // Файлы
        { wch: 22 }, // Кто готовил
        { wch: 24 }, // Контактное лицо
        { wch: 18 }, // Телефон
        { wch: 25 }, // Примечание
        { wch: 25 }  // Заметки
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Реестр КП');
      
      const fileName = onlySelected 
        ? `Выбранные_КП_ДС_Инжиниринг_${new Date().toISOString().slice(0, 10)}.xlsx`
        : `Реестр_КП_ДС_Инжиниринг_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast(onlySelected ? `Экспортировано ${sourceList.length} выбранных КП в Excel` : 'Реестр КП успешно экспортирован в Excel (.xlsx)');
      setIsExportMenuOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Ошибка при экспорте в Excel');
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // PDF Export
  const handleExportPdf = async (onlySelected: boolean = false) => {
    try {
      setIsExportingPdf(true);
      setIsExportMenuOpen(false);
      const sourceList = (onlySelected && selectedProposalIds.size > 0) ? selectedProposals : filtered;
      await exportTableToPdf({
        title: onlySelected ? 'Выписка коммерческих предложений (КП / АКП)' : 'Реестр коммерческих и альтернативных предложений (КП / АКП)',
        subtitle: 'ООО «ДС-Инжиниринг» • Департамент продаж и тендерных процедур',
        department: 'Отдел координации поставок и предложений',
        filterInfo: onlySelected ? `Выбрано записей: ${sourceList.length}` : searchQuery ? `Поиск: "${searchQuery}"` : selectedFunnelFilter !== 'all' ? `Фильтр: ${selectedFunnelFilter}` : 'Все зарегистрированные предложения',
        summaryBadges: [
          { label: 'Всего предложений', value: sourceList.length, color: 'blue' },
          { label: 'Основные КП', value: sourceList.filter(p => !p.isAlternative).length, color: 'indigo' },
          { label: 'АКП (Партнеры/Тендеры)', value: sourceList.filter(p => p.isAlternative && (p.akpPurpose === 'partner_tender' || !p.akpPurpose)).length, color: 'amber' },
          { label: 'АКП (Поставка)', value: sourceList.filter(p => p.isAlternative && p.akpPurpose === 'alternative_supply').length, color: 'green' }
        ],
        headers: ['№', 'Номер КП / АКП', 'Дата', 'Контрагент / Заказчик', 'Содержание / Предмет', 'Сумма', 'Менеджер'],
        rows: sourceList.map((cp, idx) => [
          String(idx + 1),
          {
            text: cp.outgoingNumber || '—',
            badge: cp.isAlternative,
            color: cp.isAlternative ? 'amber' : undefined,
            subtext: cp.isAlternative ? (cp.akpPurpose === 'partner_tender' || !cp.akpPurpose ? 'АКП Партнеры' : 'АКП Поставка') : undefined
          },
          String(cp.date || '—'),
          { text: cp.toCompany, subtext: cp.contactPerson ? `Контакт: ${cp.contactPerson}` : undefined },
          { text: cp.content || 'Поставка оборудования и услуг', subtext: cp.dealTitle ? `Сделка: ${cp.dealTitle}` : undefined },
          String(cp.amount ? `${Number(cp.amount).toLocaleString('ru-RU')} ₽` : 'По расчету'),
          String(cp.preparedBy || 'Скобелев А.С.')
        ]),
        columnAlignments: ['center', 'center', 'center', 'left', 'left', 'right', 'left'],
        columnWidths: ['4%', '15%', '9%', '22%', '26%', '12%', '12%'],
        orientation: 'landscape',
        filename: onlySelected 
          ? `Vypiska_KP_DS_Engineering_${new Date().toISOString().slice(0, 10)}.pdf`
          : `Reestr_KP_DS_Engineering_${new Date().toISOString().slice(0, 10)}.pdf`
      });
      showToast(onlySelected ? `Сформирован PDF-отчет по ${sourceList.length} выбранным КП` : 'PDF-отчет по предложениям успешно сформирован');
    } catch (err) {
      console.error('Failed to export proposals PDF:', err);
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
        'Исходящий номер КП',
        'Тип КП',
        'Дата',
        'Контрагент (Кому)',
        'Содержание',
        'Воронка CRM',
        'Привязанная сделка CRM',
        'Этап сделки',
        'Сумма (₽)',
        'Прикреплено файлов',
        'Кто готовил КП',
        'Контактное лицо',
        'Телефон',
        'Примечание'
      ];

      const rows = filtered.map((cp, idx) => [
        idx + 1,
        `"${(cp.outgoingNumber || '').replace(/"/g, '""')}"`,
        `"${cp.isAlternative ? (cp.akpPurpose === 'partner_tender' || !cp.akpPurpose ? 'АКП (Партнерам)' : 'АКП (Поставка)') : 'Основное'}"`,
        `"${(cp.date || '').replace(/"/g, '""')}"`,
        `"${(cp.toCompany || '').replace(/"/g, '""')}"`,
        `"${(cp.content || '').replace(/"/g, '""')}"`,
        `"${(cp.dealFunnel ? FUNNEL_LABELS[cp.dealFunnel]?.label || cp.dealFunnel : '—').replace(/"/g, '""')}"`,
        `"${(cp.dealId ? `${cp.dealId} - ${cp.dealTitle || ''}` : 'Без привязки').replace(/"/g, '""')}"`,
        `"${(cp.dealStage ? STAGE_LABELS[cp.dealStage]?.label || cp.dealStage : '').replace(/"/g, '""')}"`,
        `"${cp.amount || ''}"`,
        `"${cp.versions?.length || 0}"`,
        `"${(cp.preparedBy || '').replace(/"/g, '""')}"`,
        `"${(cp.contactPerson || '').replace(/"/g, '""')}"`,
        `"${(cp.contactPhone || '').replace(/"/g, '""')}"`,
        `"${(cp.note || '').replace(/"/g, '""')}"`
      ]);

      const csvString = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Реестр_КП_ДС_Инжиниринг_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Реестр КП успешно экспортирован в CSV (.csv)');
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

        const newProposals: CommercialProposal[] = data.map((row, index) => {
          const rawAmount = row['Сумма'] || row['Сумма (₽)'] || row['Сумма КП (₽)'];
          const numAmount = typeof rawAmount === 'number' ? rawAmount : (parseFloat(String(rawAmount).replace(/[^0-9.]/g, '')) || undefined);
          const rawType = String(row['Тип'] || row['Тип КП'] || '').toLowerCase();
          const isAkp = rawType.includes('акп') || rawType.includes('альтернатив') || String(row['Номер'] || '').includes('/АКП');

          return {
            id: `cp_import_${Date.now()}_${index}`,
            outgoingNumber: row['Исходящий номер КП'] || row['Номер КП'] || row['Номер'] || `КП-ИМП-${index + 1}`,
            date: row['Дата'] || new Date().toLocaleDateString('ru-RU'),
            toCompany: row['Кому (Компания)'] || row['Контрагент (Кому)'] || row['Кому'] || row['Компания'] || 'Заказчик',
            content: row['Содержание'] || row['Содержание коммерческого предложения'] || row['Предмет'] || '',
            preparedBy: row['Кто готовил КП'] || row['Кто готовил'] || row['Менеджер'] || 'Скобелев А.С.',
            note: row['Примечание'] || '',
            internalNotes: row['Внутренние заметки'] || row['Заметки'] || '',
            contactPerson: row['Контактное лицо'] || '',
            contactPhone: row['Контактный телефон'] || row['Телефон'] || '',
            dealId: row['Сделка'] || row['ID сделки'] || undefined,
            dealTitle: row['Название сделки'] || undefined,
            dealFunnel: row['Воронка'] || undefined,
            amount: numAmount,
            isAlternative: isAkp,
            versions: []
          };
        });

        if (newProposals.length > 0) {
          if (propSetProposals) {
            propSetProposals(prev => [...newProposals, ...prev]);
          } else {
            setCurrentProposals(prev => [...newProposals, ...prev]);
          }
          showToast(`Успешно импортировано ${newProposals.length} коммерческих предложений`);
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

  // Deals available in modal selector, filtered by funnel if chosen and by search query
  const modalDealsList = useMemo(() => {
    return effectiveDeals.filter(d => {
      // Funnel match: if dealFunnel is not set, 'all', or deal is already bound, keep it in list
      const funnelMatch = !formData.dealFunnel || formData.dealFunnel === ('all' as any) || d.funnel === formData.dealFunnel || d.id === formData.dealId;
      // Search match
      const q = modalDealSearch.toLowerCase().trim();
      const searchMatch = !q || 
        d.id.toLowerCase().includes(q) || 
        d.companyName.toLowerCase().includes(q) || 
        d.serviceType.toLowerCase().includes(q);
      return funnelMatch && searchMatch;
    });
  }, [effectiveDeals, formData.dealFunnel, formData.dealId, modalDealSearch]);

  const selectedDealInfo = useMemo(() => {
    if (!formData.dealId) return null;
    return effectiveDeals.find(d => d.id === formData.dealId);
  }, [formData.dealId, effectiveDeals]);

  if (isUnifiedGeneratorOpen) {
    return (
      <TkpTzGeneratorView
        onBack={() => {
          setIsUnifiedGeneratorOpen(false);
          setActiveGeneratorProposalId(undefined);
          setActiveGeneratorDealId(undefined);
        }}
        initialProposalId={activeGeneratorProposalId}
        initialDealId={activeGeneratorDealId}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Реестр коммерческих предложений
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Управление выставленными КП, версиями, привязкой к сделкам и аналитикой воронки.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => {
                setActiveGeneratorProposalId(undefined);
                setActiveGeneratorDealId(undefined);
                setIsUnifiedGeneratorOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать ТКП / ТЗ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Toolbar */}
      <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Поиск по номеру КП, АКП, компании, сделке, содержанию, менеджеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Funnel & Type Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedFunnelFilter}
              onChange={(e) => setSelectedFunnelFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Все предложения ({countAll})</option>
              <option value="standard">Только основные КП ({countStandard})</option>
              <option value="akp_partner">АКП: Для партнеров (Тендеры) ({countPartnerAkp})</option>
              <option value="akp_supply">АКП: Альтернативная поставка ({countSupplyAkp})</option>
              <option value="akp">Все АКП ({countAkp})</option>
              <option value="linked">Привязаны к сделкам CRM</option>
              <option value="unlinked">Без привязки к сделке</option>
              <option value="equipment">Воронка: Оборудование и ПО</option>
              <option value="services">Воронка: 3D-услуги и инжиниринг</option>
              <option value="support">Воронка: Сервис и ТО КИМ</option>
            </select>
          </div>

          {/* View Mode & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Подробная таблица с колонками"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Таблица</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Компактный вид карточек"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Компактный вид</span>
              </button>
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                title="Экспорт реестра КП в файл"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Экспорт</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-lg shadow-sm z-30 py-1 overflow-hidden">
                  <button
                    onClick={() => handleExportPdf(false)}
                    disabled={isExportingPdf}
                    className="w-full flex items-center gap-2 px-4.5 py-2.5 text-left text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="font-bold">PDF Отчет (.pdf)</div>
                      <div className="text-[10px] text-gray-400">С печатями и подписью</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExportExcel(false)}
                    className="w-full flex items-center gap-2 px-4.5 py-2.5 text-left text-xs font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer border-t border-gray-100"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">Excel (.xlsx)</div>
                      <div className="text-[10px] text-gray-400">Форматированная таблица с АКП</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="w-full flex items-center gap-2 px-4.5 py-2.5 text-left text-xs font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-colors border-t border-gray-100 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold">CSV (.csv)</div>
                      <div className="text-[10px] text-gray-400">Универсальный экспорт (UTF-8)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Import Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-white border border-gray-300 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Импорт коммерческих предложений из Excel/CSV"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Импорт</span>
            </button>

          </div>
        </div>

        {/* Quick Filter Tabs: All, Standard, Partner AKP, Supply AKP */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs">
          <button
            onClick={() => setSelectedFunnelFilter('all')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedFunnelFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            <span>Все предложения</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-md ${selectedFunnelFilter === 'all' ? 'bg-blue-700 text-white' : 'bg-white text-slate-500'}`}>
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setSelectedFunnelFilter('standard')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedFunnelFilter === 'standard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
            }`}
          >
            <span>Основные КП</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-md ${selectedFunnelFilter === 'standard' ? 'bg-blue-700 text-white' : 'bg-white text-slate-500'}`}>
              {countStandard}
            </span>
          </button>

          <button
            onClick={() => setSelectedFunnelFilter('akp_partner')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
              selectedFunnelFilter === 'akp_partner'
                ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="АКП для партнеров под тендеры (выделены серым фоном)"
          >
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span>АКП • Партнерам (Тендер)</span>
            <span className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-md ${selectedFunnelFilter === 'akp_partner' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'}`}>
              {countPartnerAkp}
            </span>
          </button>

          <button
            onClick={() => setSelectedFunnelFilter('akp_supply')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
              selectedFunnelFilter === 'akp_supply'
                ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
            }`}
            title="АКП для альтернативной поставки (без серого фона)"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>АКП • Поставка (Аналог)</span>
            <span className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-md ${selectedFunnelFilter === 'akp_supply' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'}`}>
              {countSupplyAkp}
            </span>
          </button>

          {countAkp > 0 && (
            <button
              onClick={() => setSelectedFunnelFilter('akp')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 text-gray-500 hover:text-gray-800 ${
                selectedFunnelFilter === 'akp' ? 'text-gray-900 font-bold underline' : ''
              }`}
            >
              <span>Все АКП ({countAkp})</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin indicator banner */}
      {isAdmin && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50/80 border border-blue-200/60 rounded-lg text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">
              Режим Администратора: вам доступно полное редактирование любых полей КП, пометки АКП, прикрепления файлов и привязок к сделкам/воронкам.
            </span>
          </div>
          <span className="text-[11px] text-blue-700 font-bold hidden sm:inline">
            Доступно сделок для связки: {effectiveDeals.length}
          </span>
        </div>
      )}

      {/* Proposals Registry Content (Table or Compact View) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Usability Hint Bar */}
        <div className="px-4 py-2.5 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-3 text-xs text-blue-950 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="font-semibold">
              Быстрый переход: нажмите на любую строку или карточку для открытия официального бланка ТКП с возможностью печати и редактирования.
            </span>
          </div>
          <div className="text-[11px] text-blue-700 dark:text-blue-300 font-medium hidden sm:block shrink-0">
            Всего записей: {filtered.length} {selectedProposalIds.size > 0 && `(выбрано: ${selectedProposalIds.size})`}
          </div>
        </div>

        {viewMode === 'table' ? (
          <HorizontalScrollContainer>
            <table className="w-full data-dense-table text-left text-xs whitespace-nowrap border-collapse min-w-[1000px]">
              <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 text-[11px] uppercase font-bold text-gray-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="w-10 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title={allFilteredSelected ? 'Снять выделение со всех' : 'Выбрать все КП в текущем списке'}
                    />
                  </th>
                  <th className="px-4 py-3">Номер КП / Тип</th>
                  <th className="px-4 py-3">Дата</th>
                  <th className="px-4 py-3">Кому (Контрагент)</th>
                  <th className="px-4 py-3">Содержание предложения</th>
                  <th className="px-4 py-3">Файлы / Документы</th>
                  <th className="px-4 py-3">Привязка к сделке и воронке</th>
                  <th className="px-4 py-3 text-right">Сумма (с НДС 22%)</th>
                  <th className="px-4 py-3">Кто готовил</th>
                  <th className="px-4 py-3">Контакты</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filtered.length > 0 ? filtered.map((cp) => {
                  const stageInfo = cp.dealStage ? STAGE_LABELS[cp.dealStage] : null;
                  const isAkp = Boolean(cp.isAlternative);
                  const isPartnerAkp = isAkp && (cp.akpPurpose === 'partner_tender' || !cp.akpPurpose);
                  const isSupplyAkp = isAkp && cp.akpPurpose === 'alternative_supply';
                  const funnelInfo = cp.dealFunnel ? FUNNEL_LABELS[cp.dealFunnel] : null;
                  const isSelected = selectedProposalIds.has(cp.id);

                  return (
                    <tr 
                      key={cp.id} 
                      onClick={() => {
                        setViewingDocProposal(cp);
                        setViewingDocVersion(cp.versions?.[0]);
                      }}
                      title="Нажмите для открытия бланка ТКП с возможностью печати и редактирования"
                      className={`transition-all duration-150 group cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
                          : isPartnerAkp 
                            ? 'bg-slate-100/90 dark:bg-slate-800/60 hover:bg-slate-200 text-slate-800 border-l-4 border-l-slate-500 hover:shadow-xs' 
                            : 'hover:bg-blue-50/60 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900 hover:shadow-xs'
                      }`}
                    >
                      {/* Checkbox */}
                      <td 
                        className="w-10 px-3 py-3.5 text-center" 
                        onClick={(e) => handleToggleSelectOne(cp.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectOne(cp.id, e)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          title={isSelected ? 'Снять выбор' : 'Выбрать КП'}
                        />
                      </td>
                      {/* Outgoing Number & AKP Badge */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <FileText className={`w-3.5 h-3.5 shrink-0 ${isPartnerAkp ? 'text-slate-500' : 'text-blue-600 group-hover:scale-110 transition-transform'}`} />
                          <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 transition-colors flex items-center gap-1">
                            {cp.outgoingNumber}
                            <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                          </span>
                          {isPartnerAkp && (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-400 shadow-2xs"
                              title="АКП для партнеров (под тендерные процедуры) — выделено серым цветом"
                            >
                              АКП • Партнерам
                            </span>
                          )}
                          {isSupplyAkp && (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-300 shadow-2xs"
                              title="АКП для альтернативной поставки (аналог / оптимизация бюджета) — не выделяется серым"
                            >
                              АКП • Поставка
                            </span>
                          )}
                          {(cp.isNeutralTemplate || cp.templateMode === 'impersonal') && (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs"
                              title="Обезличенный шаблон (White-label) — без реквизитов организации и номеров"
                            >
                              White-label
                            </span>
                          )}
                        </div>
                        {cp.note && (
                          <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate max-w-[180px]" title={cp.note}>
                            {cp.note}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-gray-500 dark:text-slate-400 font-medium">
                        {cp.date}
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                          <span className="text-blue-950 dark:text-blue-300 font-bold group-hover:text-blue-700 transition-colors">{cp.toCompany}</span>
                        </div>
                      </td>

                      {/* Content */}
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={cp.content}>
                        <span className="font-medium text-gray-800 dark:text-slate-200">{cp.content}</span>
                      </td>

                      {/* Attached Files / Document Viewer Trigger */}
                      <td className="px-4 py-3.5">
                        {cp.versions && cp.versions.length > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingDocProposal(cp);
                              setViewingDocVersion(cp.versions?.[cp.versions.length - 1]);
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer group/file ${
                              isPartnerAkp
                                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                                : 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            }`}
                            title={`Просмотреть прикрепленный файл: ${cp.versions[cp.versions.length - 1].name}`}
                          >
                            <Paperclip className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover/file:opacity-100" />
                            <span className="truncate max-w-[130px]">
                              {cp.versions.length > 1 
                                ? `${cp.versions.length} файла (v${cp.versions[cp.versions.length - 1].version})` 
                                : cp.versions[0].name}
                            </span>
                            <Eye className="w-3 h-3 ml-0.5 opacity-60 group-hover/file:opacity-100" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingDocProposal(cp);
                              setViewingDocVersion(undefined);
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-gray-500 dark:text-slate-400 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            title="Просмотреть официальный электронный бланк КП"
                          >
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span>Бланк КП</span>
                          </button>
                        )}
                      </td>

                      {/* Linked Deal, Funnel & Stage */}
                      <td className="px-4 py-3.5">
                        {cp.dealId ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[10px] tracking-wider">
                                {cp.dealId}
                              </span>
                              {cp.dealTitle && (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px]" title={cp.dealTitle}>
                                  {cp.dealTitle}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {funnelInfo && (
                                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium flex items-center gap-0.5">
                                  <span>{funnelInfo.icon}</span>
                                  <span>{funnelInfo.label.split(' ')[0]}</span>
                                </span>
                              )}
                              {stageInfo && (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${stageInfo.color}`}>
                                  {stageInfo.label}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : cp.dealFunnel ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-semibold">
                              {FUNNEL_LABELS[cp.dealFunnel]?.icon} {FUNNEL_LABELS[cp.dealFunnel]?.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium italic">
                            Без привязки к сделке
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white text-right">
                        {cp.amount ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-extrabold font-mono tabular-nums">
                            {cp.amount.toLocaleString('ru-RU')} {getCurrencySymbol(cp.currency || 'RUB')}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal text-[11px] font-mono tabular-nums">По запросу</span>
                        )}
                      </td>

                      {/* Prepared By */}
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                        {cp.preparedBy}
                      </td>

                      {/* Contacts */}
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {cp.contactPerson && (
                          <div className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span>{cp.contactPerson}</span>
                          </div>
                        )}
                        {cp.contactPhone && (
                          <div className="text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{cp.contactPhone}</span>
                          </div>
                        )}
                        {!cp.contactPerson && !cp.contactPhone && (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions (Cleaned up: Quick Edit in Studio, Quick Print, Link Deal, Clone, Delete) */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGeneratorProposalId(cp.id);
                              setActiveGeneratorDealId(cp.dealId);
                              setIsUnifiedGeneratorOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Редактировать в интерактивном конструкторе ТКП/ТЗ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              showToast('Генерация ТКП в PDF, пожалуйста подождите...');
                              try {
                                await downloadProposalPdf(cp);
                              } catch (error) {
                                console.error('Ошибка при генерации ТКП:', error);
                                showToast('Ошибка при генерации ТКП');
                              }
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Скачать ТКП в PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCloneProposal(cp, e)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Создать дубликат / копию КП"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(cp.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Удалить КП (права администратора)"
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
                    <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <div className="text-sm font-bold text-slate-500">Коммерческие предложения не найдены</div>
                      <div className="text-xs text-gray-400 mt-1">Попробуйте изменить фильтры или добавьте новое КП</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </HorizontalScrollContainer>
        ) : (
          /* COMPACT VIEW MODE */
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map((cp) => {
                  const stageInfo = cp.dealStage ? STAGE_LABELS[cp.dealStage] : null;
                  const isAkp = Boolean(cp.isAlternative);
                  const isPartnerAkp = isAkp && (cp.akpPurpose === 'partner_tender' || !cp.akpPurpose);
                  const isSupplyAkp = isAkp && cp.akpPurpose === 'alternative_supply';
                  const funnelInfo = cp.dealFunnel ? FUNNEL_LABELS[cp.dealFunnel] : null;
                  const isSelected = selectedProposalIds.has(cp.id);

                  return (
                    <div
                      key={cp.id}
                      onClick={() => {
                        setViewingDocProposal(cp);
                        setViewingDocVersion(cp.versions?.[0]);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900 hover:shadow-md group relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : isPartnerAkp
                            ? 'border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div>
                        {/* Header: Number, AKP, Date & Select */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${isPartnerAkp ? 'text-slate-500' : 'text-blue-600'}`} />
                            <span className="font-black text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {cp.outgoingNumber}
                            </span>
                            {isPartnerAkp && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                АКП
                              </span>
                            )}
                            {isSupplyAkp && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Аналог
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-medium">{cp.date}</span>
                            <div onClick={(e) => handleToggleSelectOne(cp.id, e)}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleToggleSelectOne(cp.id, e)}
                                className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Counterparty & Content */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{cp.toCompany}</span>
                          </div>
                          {cp.content && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2" title={cp.content}>
                              {cp.content}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Financial & Deal Footer */}
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Сумма (с НДС 22%):</div>
                          <div className="font-black text-sm font-mono text-emerald-600 dark:text-emerald-400">
                            {cp.amount ? `${cp.amount.toLocaleString('ru-RU')} ₽` : 'По запросу'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-right">
                          <span className="text-[10px] text-slate-400 truncate max-w-[90px] block" title={`Менеджер: ${cp.preparedBy}`}>
                            {cp.preparedBy?.split(' ')[0]}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGeneratorProposalId(cp.id);
                              setActiveGeneratorDealId(cp.dealId);
                              setIsUnifiedGeneratorOpen(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Редактировать в конструкторе ТКП/ТЗ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              showToast('Генерация ТКП в PDF...');
                              try {
                                await downloadProposalPdf(cp);
                              } catch (err) {
                                showToast('Ошибка при генерации PDF');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Скачать PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-500">Коммерческие предложения не найдены</div>
                <div className="text-xs text-gray-400 mt-1">Попробуйте изменить фильтры или создайте новое КП</div>
              </div>
            )}
          </div>
        )}

        {/* Table Footer Stats */}
        <div className="px-6 py-3.5 bg-slate-50/90 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-3">
            <span>Всего в реестре: <strong>{currentProposals.length}</strong></span>
            <span>•</span>
            <span>Показано: <strong>{filtered.length}</strong></span>
            <span>•</span>
            <span className="text-slate-700 font-semibold">АКП: <strong>{countAkp}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              Сумма отфильтрованных: <span className="font-bold text-emerald-700">
                {filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('ru-RU')} ₽
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Proposal Document / Attached Files Viewer Modal */}
      {viewingDocProposal && (
        <ProposalDocumentViewerModal
          proposal={viewingDocProposal}
          version={viewingDocVersion}
          onClose={() => {
            setViewingDocProposal(null);
            setViewingDocVersion(undefined);
          }}
          onSelectVersion={(ver) => setViewingDocVersion(ver)}
          onEdit={(p) => {
            setViewingDocProposal(null);
            handleOpenEdit(p);
          }}
          onDelete={(id) => {
            handleDeleteProposal(id);
            setViewingDocProposal(null);
          }}
          canEdit={canEdit}
          isAdmin={isAdmin}
        />
      )}

      {/* Confirmation Modal: Delete */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Удалить коммерческое предложение?</h3>
              <p className="text-xs text-gray-500">
                Это действие удалит запись из базы реестра КП. Данные нельзя будет восстановить.
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
                onClick={() => handleDeleteProposal(deleteConfirmId)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer shadow-sm"
              >
                Удалить запись
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
                // Also auto-select it if possible
                if (res.data && res.data.name) {
                   setFormData(prev => ({ ...prev, toCompany: res.data.name }));
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
                if (res.data && res.data.fullName) {
                   setFormData(prev => ({ ...prev, contactPerson: res.data.fullName, contactPhone: res.data.mobilePhone || res.data.workPhone || prev.contactPhone }));
                }
              }
              setIsContModalOpen(false);
              showToast('Контакт успешно добавлен в базу!');
            } else {
              showToast('Ошибка при добавлении контакта');
            }
          }}
          companies={crmCompanies}
          initialCompanyId={crmCompanies.find(c => c.name === formData.toCompany)?.id}
        />
      )}
    </div>
  );
};
