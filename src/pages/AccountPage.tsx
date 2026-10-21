import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid,
  Table as TableIcon,
  List as ListIcon,
  Building2, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Send,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  Sparkles,
  Lock,
  KeyRound,
  Briefcase,
  ChevronRight,
  ShieldAlert,
  Users,
  Edit3,
  Trash2,
  Paperclip,
  Eye,
  Search,
  Filter,
  Cpu,
  Server,
  MessageSquare,
  BookOpen,
  Camera,
  UserCheck,
  HelpCircle,
  Folder,
  TrendingUp,
  PieChart,
  Award,
  Calendar,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  RotateCcw,
  GraduationCap,
  ClipboardCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_ADMIN_ACCOUNTS, DEFAULT_CLIENT_ACCOUNTS } from '../data/mockData';
import { apiService } from '../services/apiService';
import { formatUserInitials } from '../utils/userFormatting';

import { CertificatesRegistry } from '../components/crm/CertificatesRegistry';
import { MetrologyReportsRegistry } from '../components/crm/MetrologyReportsRegistry';
import { UnifiedCommunicationsHub } from '../components/common/UnifiedCommunicationsHub';
import { BotSettingsView } from '../components/crm/BotSettingsView';
import { CrmRealtimeLogsView } from '../components/crm/CrmRealtimeLogsView';
import { AssetsManagerView } from '../components/crm/AssetsManagerView';
import { AccountSidebarTree } from '../components/account/AccountSidebarTree';
import { ContractsRegistry } from '../components/crm/ContractsRegistry';
import { ClientDashboard } from '../components/client-portal/ClientDashboard';
import { LicensesRegistry } from '../components/crm/LicensesRegistry';
import { SupportRegistry } from '../components/crm/SupportRegistry';
import { CrmManualView } from '../components/crm/CrmManualView';
import { TasksSidebarWidget } from '../components/crm/TasksSidebarWidget';

import { ClientFaqSection } from '../components/knowledge/ClientFaqSection';
import { StaffCabinetManualView } from '../components/knowledge/StaffCabinetManualView';
import { ManagerFaqSection, MANAGER_FAQ_DATA } from '../components/knowledge/ManagerFaqSection';
import { UserManagementPanel } from '../components/account/UserManagementPanel';
import { AccountContractModal } from '../components/account/AccountContractModal';
import { AccountTicketModal } from '../components/account/AccountTicketModal';
import { AccountLicenseModal } from '../components/account/AccountLicenseModal';
import { AccountFileModal } from '../components/account/AccountFileModal';
import { AccountDocViewerModal } from '../components/account/AccountDocViewerModal';
import { ProfilePhotoModal } from '../components/account/ProfilePhotoModal';
import { ClientRfqModal } from '../components/account/ClientRfqModal';
import { Calculator } from 'lucide-react';
import { ProjectContract, SupportTicketItem, LicenseItem, AttachedDocument, AuthAccount } from '../types';

const INITIAL_CONTRACTS: ProjectContract[] = [
  {
    id: 'cnt-01',
    number: 'ДОГ-2026/014',
    title: 'Внедрение TopSolid 7 + 2 лицензии TopSolid\'CAM 7 (5-axis) + PDM',
    company: 'АО «Авиаагрегат-Самара»',
    date: '15.01.2026',
    status: 'Действует',
    statusColor: 'emerald',
    supportUntil: '15.01.2027',
    curator: 'Скобелев Александр Сергеевич',
    curatorPhone: '+7 (937) 984-61-51',
    amount: 'По договору',
    scope: 'Поставка лицензий TopSolid\'CAM 7, развертывание защищенного PDM-хранилища, разработка постпроцессоров DMU 50 и Hermle C40, технический инструктаж технологов.',
    documents: [
      {
        id: 'doc-cnt-101',
        name: 'Договор_Поставки_ПО_ДОГ-2026-014.pdf',
        category: 'Договор и приложения',
        size: '2.4 MB',
        uploadedAt: '15.01.2026',
        uploadedBy: 'Юридический отдел',
      },
      {
        id: 'doc-cnt-102',
        name: 'Спецификация_и_ТЗ_на_постпроцессор_DMU50.pdf',
        category: 'Спецификация и смета',
        size: '1.2 MB',
        uploadedAt: '16.01.2026',
        uploadedBy: 'Скобелев А.С.',
      },
      {
        id: 'doc-cnt-103',
        name: 'Акт_приема_передачи_прав_на_ПО.pdf',
        category: 'Акт сдачи-приемки',
        size: '890 KB',
        uploadedAt: '28.01.2026',
        uploadedBy: 'Бухгалтерия',
      },
    ],
  },
  {
    id: 'cnt-02',
    number: 'ДОГ-2025/189',
    title: 'Поставка мобильной КИМ Hexagon ROMER Absolute Arm 7525SE + PolyWorks',
    company: 'ПАО «ОДК-Кузнецов»',
    date: '10.11.2025',
    status: 'Выполнен (На гарантии)',
    statusColor: 'blue',
    supportUntil: '10.11.2027',
    curator: 'Ярыш Иван Владимирович',
    curatorPhone: '+7 (927) 748-46-58',
    amount: '6 850 000 ₽',
    scope: 'Поставка 7-осевой измерительной руки с лазерным сканером RS6, комплект калибровочных сфер, ПО PolyWorks|Inspector Premium и первичная поверка.',
    documents: [
      {
        id: 'doc-cnt-201',
        name: 'Контракт_Hexagon_7525SE_ДС-189.pdf',
        category: 'Договор и приложения',
        size: '3.1 MB',
        uploadedAt: '10.11.2025',
        uploadedBy: 'Коммерческий отдел',
      },
      {
        id: 'doc-cnt-202',
        name: 'Свидетельство_поверки_АРШИН_Hexagon.pdf',
        category: 'Паспорт и сертификат',
        size: '1.4 MB',
        uploadedAt: '18.11.2025',
        uploadedBy: 'Метрологическая служба',
      },
      {
        id: 'doc-cnt-203',
        name: 'Акт_ввода_в_эксплуатацию_КИМ.pdf',
        category: 'Акт сдачи-приемки',
        size: '950 KB',
        uploadedAt: '25.11.2025',
        uploadedBy: 'Ярыш И.В.',
      },
    ],
  },
  {
    id: 'cnt-03',
    number: 'ДОГ-2025/112',
    title: 'Проектирование и изготовление комплекта технологической оснастки и штампов',
    company: 'ООО «Самарский резервуарный завод»',
    date: '14.06.2025',
    status: 'Сдан в эксплуатацию',
    statusColor: 'gray',
    supportUntil: '14.06.2026',
    curator: 'Морозов Владимир Георгиевич',
    curatorPhone: '+7 (902) 371-20-16',
    amount: '2 400 000 ₽',
    scope: 'Разработка КД, математическое моделирование штамповки в TopSolid, изготовление формообразующих вставок и испытания опытной партии.',
    documents: [
      {
        id: 'doc-cnt-301',
        name: 'Договор_на_оснастку_ДОГ-112.pdf',
        category: 'Договор и приложения',
        size: '1.8 MB',
        uploadedAt: '14.06.2025',
        uploadedBy: 'Морозов В.Г.',
      },
      {
        id: 'doc-cnt-302',
        name: 'Контрольный_протокол_измерений_штампа.pdf',
        category: 'Паспорт и сертификат',
        size: '4.2 MB',
        uploadedAt: '02.08.2025',
        uploadedBy: 'ОТК',
      },
    ],
  },
];


export const AccountPage: React.FC = () => {
  const { 
    currentUser, 
    userPermissions,
    authUsers,
    login, 
    logout, 
    register, 
    updateUser,
    isAdmin, 
    contracts,
    setContracts,
    addContract,
    updateContract,
    deleteContract,
    navigateTo, 
    showToast,
    setIsPrivacyModalOpen,
    supportTickets,
    setSupportTickets,
    licenses,
    setLicenses,
    deals,
    fleetDevices,
    resetCrmDatabase
  } = useApp();

  const [isResettingCrmDb, setIsResettingCrmDb] = useState(false);

  // Auth Mode when not logged in
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    password: '',
    agree152Fz: false,
  });

  // Permissions & Tabs Access Control
  const hasCrmAccess = isAdmin || !!userPermissions?.canAccessCrm;
  const canAccessCms = isAdmin || !!userPermissions?.canAccessCms;
  const canManageUsers = isAdmin || !!userPermissions?.canManageUsers;
  const canManageContracts = isAdmin || !!userPermissions?.canManageContracts;
  const canManageTickets = isAdmin || !!userPermissions?.canManageTickets;
  const canManageLicenses = isAdmin || !!userPermissions?.canManageLicenses;
  const canViewCertificates = isAdmin || !!userPermissions?.canViewCertificates;
  const canViewMetrologyReports = isAdmin || !!userPermissions?.canViewMetrologyReports;
  
  
  const [activeModule, setActiveModule] = useState<'docs' | 'knowledge' | 'admin'>(() => {
    try {
      const savedMod = sessionStorage.getItem('ds_account_module');
      if (savedMod === 'admin' && (isAdmin || canManageUsers)) return 'admin';
      if (savedMod === 'knowledge') return 'knowledge';
      if (savedMod === 'docs') return 'docs';
    } catch {}
    if (isAdmin || canManageUsers) return 'admin';
    return 'docs';
  });

  const [activeSubTab, setActiveSubTab] = useState<string>(() => {
    try {
      const savedSub = sessionStorage.getItem('ds_account_subtab');
      if (savedSub) return savedSub;
    } catch {}
    if (isAdmin || canManageUsers) return 'users';
    return hasCrmAccess ? 'contracts' : 'client-dashboard';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Access Level Gradation Details
  const getAccessLevelInfo = (role?: string) => {
    switch (role) {
      case 'superadmin':
        return {
          title: 'Супер-администратор (Полный доступ)',
          shortLabel: 'SuperAdmin',
          badgeClass: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-gray-950 font-black shadow-xs border border-amber-300/60',
          avatarBadgeClass: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-950 font-black ring-2 ring-blue-900 shadow-xs',
          desc: 'Главный руководитель с неограниченными правами: CMS, CRM, база данных, финансовые отчеты и управление учетными записями.'
        };
      case 'admin':
        return {
          title: 'Администратор системы',
          shortLabel: 'Admin',
          badgeClass: 'bg-slate-900 text-white font-bold shadow-xs',
          avatarBadgeClass: 'bg-slate-900 text-white font-bold ring-2 ring-blue-900',
          desc: 'Администрирование сайта, контент CMS, воронки продаж, договоры и настройки реестров.'
        };
      case 'moderator':
        return {
          title: 'Модератор / Техподдержка',
          shortLabel: 'Модератор',
          badgeClass: 'bg-teal-700 text-white font-bold shadow-xs',
          avatarBadgeClass: 'bg-teal-700 text-white font-bold ring-2 ring-blue-900',
          desc: 'Обработка сервисных заявок, контроль документации и статей базы знаний.'
        };
      case 'manager':
        return {
          title: 'Менеджер проектов (Сотрудник)',
          shortLabel: 'Manager',
          badgeClass: 'bg-blue-500 text-white font-bold shadow-xs',
          avatarBadgeClass: 'bg-blue-500 text-white font-black ring-2 ring-blue-900',
          desc: 'Ведение коммерческих предложений, контрагентов, оперативных задач и договоров поставки.'
        };
      case 'client':
      default:
        return {
          title: 'Клиентский доступ',
          shortLabel: 'Клиент',
          badgeClass: 'bg-blue-400/30 text-blue-100 border border-blue-300/40 font-semibold',
          avatarBadgeClass: 'bg-blue-600 text-white font-bold ring-2 ring-blue-900',
          desc: 'Личный кабинет заказчика: доступ к подписанным договорам, выданным лицензиям и сервисным заявкам.'
        };
    }
  };

  const currentAccessInfo = getAccessLevelInfo(currentUser?.role);

  // Synchronize active tab when permissions change dynamically
  useEffect(() => {
    if (activeModule === 'admin' && !canManageUsers && !isAdmin) {
      setActiveModule('docs');
      setActiveSubTab(hasCrmAccess ? 'contracts' : 'client-dashboard');
    }
  }, [hasCrmAccess, canManageUsers, isAdmin, activeModule]);

  const handleModuleSwitch = (mod: 'docs' | 'knowledge' | 'admin', defaultSubTab: string) => {
    setActiveModule(mod);
    setActiveSubTab(defaultSubTab);
    try {
      sessionStorage.setItem('ds_account_module', mod);
      sessionStorage.setItem('ds_account_subtab', defaultSubTab);
    } catch {}
    setIsMobileDrawerOpen(false);
  };

  const handleSelectSubTab = (moduleId: 'docs' | 'knowledge' | 'admin', subTabId: string) => {
    setActiveModule(moduleId);
    setActiveSubTab(subTabId);
    try {
      sessionStorage.setItem('ds_account_module', moduleId);
      sessionStorage.setItem('ds_account_subtab', subTabId);
    } catch {}
    setIsMobileDrawerOpen(false);
  };

  const [employeeGuideSubTab, setEmployeeGuideSubTab] = useState<'manual' | 'faq'>('manual');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const [rfqs, setRfqs] = useState<any[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ds_account_contracts_v2', JSON.stringify(contracts));
    } catch {}
  }, [contracts]);

  useEffect(() => {
    try {
      localStorage.setItem('ds_account_tickets_v2', JSON.stringify(supportTickets));
    } catch {}
  }, [supportTickets]);

  useEffect(() => {
    try {
      localStorage.setItem('ds_account_licenses_v2', JSON.stringify(licenses));
    } catch {}
  }, [licenses]);

  // Load RFQs
  useEffect(() => {
    let isMounted = true;
    if (!currentUser) return;
    apiService.getServiceRequests(currentUser.role, currentUser.company).then((data) => {
      if (isMounted) {
        const seen = new Set<string>();
        const unique = (data || []).filter((item: any) => {
          if (!item?.id || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setRfqs(unique);
      }
    });
    return () => { isMounted = false; };
  }, [currentUser]);

  // Modals Management States
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ProjectContract | null>(null);

  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicketItem | null>(null);

  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<LicenseItem | null>(null);
  const [isNewRfqModalOpen, setIsNewRfqModalOpen] = useState(false);

  // Direct File Modals (Add file directly to contract/license/ticket)
  const [attachFileTarget, setAttachFileTarget] = useState<{
    type: 'contract' | 'ticket' | 'license';
    entityId: string;
    entityTitle: string;
  } | null>(null);

  // Document Viewer Modal State
  const [viewingDocState, setViewingDocState] = useState<{
    doc: AttachedDocument;
    parentTitle: string;
    entityNumber?: string;
  } | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [licensesSearchQuery, setLicensesSearchQuery] = useState('');
  const [licensesViewMode, setLicensesViewMode] = useState<'cards' | 'table' | 'list'>('cards');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  // Handlers for Contracts
  const handleSaveContract = (savedContract: ProjectContract) => {
    if (editingContract) {
      setContracts(contracts.map(c => c.id === savedContract.id ? savedContract : c));
      showToast(`Договор ${savedContract.number} успешно обновлен`);
    } else {
      setContracts([savedContract, ...contracts]);
      showToast(`Договор ${savedContract.number} успешно создан`);
    }
    setEditingContract(null);
  };

  const handleDeleteContract = (contractId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Вы действительно хотите удалить данный договор и все прикрепленные к нему файлы?')) {
      setContracts(contracts.filter(c => c.id !== contractId));
      showToast('Договор удален');
    }
  };

  // Handlers for Tickets
  const handleSaveTicket = (savedTicket: SupportTicketItem) => {
    if (editingTicket) {
      setSupportTickets(supportTickets.map(t => t.id === savedTicket.id ? savedTicket : t));
      showToast(`Обращение ${savedTicket.id} обновлено`);
    } else {
      setSupportTickets([savedTicket, ...supportTickets]);
      showToast(`Обращение ${savedTicket.id} зарегистрировано!`);
    }
    setEditingTicket(null);
  };

  // Handlers for Licenses
  const handleSaveLicense = (savedLicense: LicenseItem) => {
    if (editingLicense) {
      setLicenses(licenses.map(l => l.id === savedLicense.id ? savedLicense : l));
      showToast(`Лицензия «${savedLicense.title}» сохранена`);
    } else {
      setLicenses([savedLicense, ...licenses]);
      showToast(`Лицензия «${savedLicense.title}» зарегистрирована`);
    }
    setEditingLicense(null);
  };

  const handleDeleteLicense = (licenseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Удалить запись о лицензии и прикрепленные файлы ключей?')) {
      setLicenses(licenses.filter(l => l.id !== licenseId));
      showToast('Лицензия удалена');
    }
  };

  // Direct Attach File Handler
  const handleSaveDirectFile = (doc: AttachedDocument) => {
    if (!attachFileTarget) return;

    if (attachFileTarget.type === 'contract') {
      setContracts(contracts.map(c => {
        if (c.id === attachFileTarget.entityId) {
          return { ...c, documents: [...c.documents, doc] };
        }
        return c;
      }));
      showToast(`Файл «${doc.name}» прикреплен к договору`);
    } else if (attachFileTarget.type === 'ticket') {
      setSupportTickets(supportTickets.map(t => {
        if (t.id === attachFileTarget.entityId) {
          return { ...t, attachments: [...t.attachments, doc] };
        }
        return t;
      }));
      showToast(`Файл «${doc.name}» прикреплен к сервисной заявке`);
    } else if (attachFileTarget.type === 'license') {
      setLicenses(licenses.map(l => {
        if (l.id === attachFileTarget.entityId) {
          return { ...l, files: [...l.files, doc] };
        }
        return l;
      }));
      showToast(`Файл «${doc.name}» прикреплен к лицензии`);
    }

    setAttachFileTarget(null);
  };

  // Superadmin impersonation session tracking for security testing
  const [impersonatingAdmin, setImpersonatingAdmin] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('ds_admin_impersonator');
    } catch {
      return null;
    }
  });

  const handleQuickSwitch = (targetUser: AuthAccount) => {
    if (currentUser?.role === 'superadmin' && targetUser.role !== 'superadmin') {
      try {
        sessionStorage.setItem('ds_admin_impersonator', currentUser.email);
        setImpersonatingAdmin(currentUser.email);
      } catch {}
    } else if (targetUser.role === 'superadmin') {
      try {
        sessionStorage.removeItem('ds_admin_impersonator');
        setImpersonatingAdmin(null);
      } catch {}
    }
    login(targetUser.email, targetUser.password);
  };

  const handleReturnToSuperadmin = () => {
    try {
      sessionStorage.removeItem('ds_admin_impersonator');
      setImpersonatingAdmin(null);
    } catch {}
    const superAdminAcc = authUsers.find(u => u.role === 'superadmin') || authUsers[0];
    if (superAdminAcc) {
      login(superAdminAcc.email, superAdminAcc.password);
      showToast('Возврат в профиль супер-администратора выполнен');
    }
  };

  // Isolate tenant-specific records if current user has 'client' role
  const isClient = currentUser?.role === 'client';

  const visibleContracts = useMemo(() => {
    if (!isClient) return contracts;
    const userCompany = (currentUser?.company || '').trim().toLowerCase();
    const userContractNum = (currentUser?.contractNumber || '').trim().toLowerCase();
    if (!userCompany && !userContractNum) return [];
    return contracts.filter(c => {
      const cCompany = (c.company || '').toLowerCase();
      const cNum = (c.number || '').toLowerCase();
      return (
        (userCompany && cCompany.includes(userCompany)) ||
        (userContractNum && cNum === userContractNum)
      );
    });
  }, [contracts, isClient, currentUser]);

  const visibleTickets = useMemo(() => {
    if (!isClient) return supportTickets;
    const userCompany = (currentUser?.company || '').trim().toLowerCase();
    const userName = (currentUser?.fullName || '').trim().toLowerCase();
    return supportTickets.filter(t => {
      const tCompany = (t.clientCompany || '').toLowerCase();
      const tName = (t.clientName || '').toLowerCase();
      return (userCompany && tCompany.includes(userCompany)) || (userName && tName.includes(userName));
    });
  }, [supportTickets, isClient, currentUser]);

  const visibleLicenses = useMemo(() => {
    if (!isClient) return licenses;
    const userCompany = (currentUser?.company || '').trim().toLowerCase();
    return licenses.filter(l => {
      const lCompany = (l.company || '').toLowerCase();
      return userCompany && lCompany.includes(userCompany);
    });
  }, [licenses, isClient, currentUser]);

  const visibleRfqs = useMemo(() => {
    if (!isClient) return rfqs;
    const userEmail = (currentUser?.email || '').trim().toLowerCase();
    return rfqs.filter(r => (r.email || '').toLowerCase() === userEmail);
  }, [rfqs, isClient, currentUser]);

  // Auth Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Введите адрес электронной почты');
      return;
    }
    const success = login(loginEmail, loginPassword);
    if (success) {
      setLoginPassword('');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName.trim() || !regForm.email.trim() || !regForm.phone.trim()) {
      showToast('Заполните обязательные поля');
      return;
    }
    if (!regForm.agree152Fz) {
      showToast('Необходимо дать согласие на обработку персональных данных в соответствии со 152-ФЗ');
      return;
    }

    const success = await register({
      fullName: regForm.fullName,
      email: regForm.email,
      phone: regForm.phone,
      company: regForm.company,
      position: regForm.position,
      password: regForm.password,
    });

    if (success) {
      setRegForm({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        password: '',
        agree152Fz: false,
      });
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: NOT LOGGED IN
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-5 sm:p-6 rounded-xl shadow-sm border-2 border-blue-800/80">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 rounded-full text-xs font-semibold text-amber-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Личный кабинет и авторизация доступа</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Вход в корпоративный портал «ДС‑Инжиниринг»
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Авторизуйтесь для доступа к договорам, проектной документации, обращениям в службу технической поддержки и лицензиям. Администраторы и менеджеры получают доступ к управлению сайтом и CRM.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-700 shadow-md space-y-6">
            <div className="flex border-b border-gray-200 pb-2">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'login'
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Вход в профиль</span>
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'register'
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Регистрация клиента</span>
              </button>
            </div>

            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">
                    Электронная почта (Email) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Введите email"
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 mb-1">
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Войти в систему</span>
                  </button>
                </div>

                {/* Quick 1-Click Login for Staff & Management */}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Быстрый вход для сотрудников и руководства:
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">1 клик для демо</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* General Director - Top Priority */}
                    <button
                      type="button"
                      onClick={() => login('s.nekrasov@ds-enginering.ru', 'admin123')}
                      className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-400/80 rounded-xl text-left transition-all group cursor-pointer shadow-xs col-span-1 sm:col-span-2 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                          👑
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-amber-950 truncate flex items-center gap-1.5">
                            <span>Некрасов Сергей Юрьевич</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-200 text-amber-900 border border-amber-300">Супер-админ</span>
                          </div>
                          <div className="text-[11px] text-amber-800 font-medium truncate">Генеральный директор • Полный доступ</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                        Войти →
                      </span>
                    </button>

                    {/* CRM Engineer Manager */}
                    <button
                      type="button"
                      onClick={() => login('a.skobelev@ds-enginering.ru', 'admin123')}
                      className="p-2.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-bold text-blue-950 truncate">Скобелев А.С.</div>
                      <div className="text-[10px] text-blue-700 truncate">Инженер по ПО / CRM</div>
                    </button>

                    {/* Metrologist Admin */}
                    <button
                      type="button"
                      onClick={() => login('v.morozov@ds-enginering.ru', 'admin123')}
                      className="p-2.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-bold text-rose-950 truncate">Морозов В.П.</div>
                      <div className="text-[10px] text-rose-700 truncate">Главный метролог / Админ</div>
                    </button>

                    {/* B2B Client */}
                    <button
                      type="button"
                      onClick={() => login('d.petrov@aviaagregat.ru', 'client123')}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left transition-all group cursor-pointer col-span-1 sm:col-span-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-emerald-950 truncate">Заказчик: АО «Авиаагрегат»</div>
                          <div className="text-[10px] text-emerald-700 truncate">Корпоративный кабинет клиента B2B</div>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">Войти →</span>
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">
                    ФИО представителя предприятия <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    placeholder="Иванов Иван Иванович"
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">
                      Наименование предприятия <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.company}
                      onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                      placeholder="АО Тяжмаш"
                      className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">
                      Должность
                    </label>
                    <input
                      type="text"
                      value={regForm.position}
                      onChange={(e) => setRegForm({ ...regForm, position: e.target.value })}
                      placeholder="Главный технолог"
                      className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">
                      Контактный телефон <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+7 (___) ___-__-__"
                      className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">
                      Электронная почта <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="engineer@plant.ru"
                      className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 mb-1">
                    Пароль для входа
                  </label>
                  <input
                    type="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Придумайте надежный пароль"
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 text-gray-900"
                  />
                </div>

                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="reg-152-fz"
                    checked={regForm.agree152Fz}
                    onChange={(e) => setRegForm({ ...regForm, agree152Fz: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="reg-152-fz" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
                    Я даю согласие на обработку персональных данных в соответствии со 152-ФЗ и принимаю{' '}
                    <button
                      type="button"
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="underline text-blue-700 font-bold hover:text-blue-900"
                    >
                      политику конфиденциальности
                    </button>
                    .
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Зарегистрироваться в личном кабинете</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: LOGGED IN USER
  // -------------------------------------------------------------
  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-6 sm:p-8 rounded-xl shadow-sm border-2 border-blue-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="block relative rounded-xl cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/40 transition-transform active:scale-95"
              title="Нажмите для смены фотографии профиля"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-16 h-16 rounded-xl object-cover ring-4 ring-white/20 group-hover:brightness-90 transition-all"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0 group-hover:bg-white/20 transition-all">
                  <span className="text-xl font-black text-white">
                    {currentUser.fullName ? currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ДС'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute -top-1.5 -right-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-md border-2 border-white/70 cursor-pointer transition-transform hover:scale-110 z-10"
              title="Сменить фото"
            >
              <Camera className="w-3 h-3" />
            </button>
            <span className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-xs z-10 ${
              currentAccessInfo.avatarBadgeClass
            }`}>
              {currentAccessInfo.shortLabel}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                currentAccessInfo.badgeClass
              }`}>
                {currentAccessInfo.title}
              </span>
              <span className="text-xs text-blue-200">{currentUser.email}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {currentUser.fullName}
            </h1>
            <p className="text-xs text-blue-100 mt-0.5">
              {currentUser.position} • {currentUser.company}
              {currentUser.contractNumber && ` (№ ${currentUser.contractNumber})`}
            </p>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {(canAccessCms || currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <button
              type="button"
              onClick={async () => {
                if (!confirm('Сбросить всю базу данных CRM и Личного кабинета к начальному состоянию?\n\nБудут восстановлены заводские эталоны договоров, счетов, коммерческих предложений, обращений клиентов и лицензий ООО «ДС-Инжиниринг».')) return;
                setIsResettingCrmDb(true);
                await resetCrmDatabase();
                setIsResettingCrmDb(false);
              }}
              disabled={isResettingCrmDb}
              className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Сбросить всю базу данных CRM и Кабинета"
            >
              <RotateCcw className={`w-4 h-4 text-amber-300 ${isResettingCrmDb ? 'animate-spin' : ''}`} />
              <span>{isResettingCrmDb ? 'Сброс базы CRM...' : 'Сброс базы CRM и Кабинета'}</span>
            </button>
          )}

          {canAccessCms && (
            <button
              onClick={() => navigateTo('cms')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Панель управления CMS</span>
            </button>
          )}

          <button
            onClick={logout}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-300" />
            <span>Выйти из профиля</span>
          </button>
        </div>
      </div>

      {/* Impersonation Banner (Visible when superadmin tests other roles) */}
      {Boolean(impersonatingAdmin) && (
        <div className="bg-amber-500/15 border-2 border-amber-500/60 rounded-xl p-3 sm:p-4 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold leading-tight">
                Режим проверки прав: Вы просматриваете кабинет под профилем <span className="underline font-black">{currentUser?.fullName}</span> ({currentUser?.role})
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                Обычные зарегистрированные заказчики не имеют доступа к чужим профилям или панели переключения.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReturnToSuperadmin}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
          >
            Вернуться в супер-админ (Некрасов С.Ю.)
          </button>
        </div>
      )}

      {/* Quick Profile Switcher Bar (Accessible ONLY for superadmin or active test impersonation) */}
      {(currentUser?.role === 'superadmin' || Boolean(impersonatingAdmin)) && (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Панель тестирования прав доступа сотрудников и заказчиков (Только Супер-администратор):</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {authUsers.map((user) => {
            const isCurrent = Boolean(
              (currentUser?.id && user?.id && currentUser.id === user.id) ||
              (currentUser?.email && user?.email && currentUser.email.toLowerCase() === user.email.toLowerCase())
            );
            const uPerms = user.permissions;
            const isSuper = user.role === 'superadmin';
            const isAdminUser = user.role === 'admin' || isSuper;
            const hasCms = isAdminUser || !!uPerms?.canAccessCms;
            const hasCrm = isAdminUser || (uPerms?.canAccessCrm !== false && (user.role === 'manager' || !!uPerms?.canAccessCrm));
            const hasMngContracts = isAdminUser || !!uPerms?.canManageContracts;
            const hasMngTickets = isAdminUser || !!uPerms?.canManageTickets;
            const hasMngLicenses = isAdminUser || !!uPerms?.canManageLicenses;

            return (
              <button
                key={user.id}
                onClick={() => handleQuickSwitch(user)}
                className={`px-4.5 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  isCurrent
                    ? isSuper
                      ? 'bg-amber-100 text-amber-950 border-2 border-amber-500 font-black ring-2 ring-amber-400/40 shadow-sm'
                      : user.role === 'admin'
                      ? 'bg-slate-200 text-slate-950 border-2 border-slate-700 font-bold ring-2 ring-slate-400/40 shadow-sm'
                      : user.role === 'moderator'
                      ? 'bg-teal-100 text-teal-950 border-2 border-teal-600 font-bold ring-2 ring-teal-400/40 shadow-sm'
                      : user.role === 'manager'
                      ? 'bg-blue-100 text-blue-950 border-2 border-blue-500 font-black ring-2 ring-blue-400/40 shadow-sm'
                      : 'bg-emerald-100 text-emerald-950 border-2 border-emerald-500 font-black ring-2 ring-emerald-400/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 hover:border-slate-300 border-2 border-slate-200 dark:border-slate-700 font-semibold shadow-xs'
                }`}
                title={`Войти как ${user.fullName} (${user.email})`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSuper
                      ? 'bg-amber-500'
                      : user.role === 'admin'
                      ? 'bg-slate-800 dark:bg-slate-200'
                      : user.role === 'moderator'
                      ? 'bg-teal-600'
                      : user.role === 'manager'
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>
                  {formatUserInitials(user.fullName)}
                </span>
                
                <div className="flex items-center gap-1">
                  {isSuper ? (
                    <span className="text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-black border border-amber-300">Супер-админ</span>
                  ) : user.role === 'admin' ? (
                    <span className="text-[9px] bg-slate-200 text-slate-900 px-1 py-0.2 rounded font-bold">Админ</span>
                  ) : user.role === 'moderator' ? (
                    <span className="text-[9px] bg-teal-100 text-teal-950 px-1 py-0.2 rounded font-bold border border-teal-300">Модератор</span>
                  ) : (
                    <>
                      {hasCms && (
                        <span className="text-[9px] bg-slate-200 text-slate-900 px-1 py-0.2 rounded font-bold ring-1 ring-slate-400/40">CMS</span>
                      )}
                      {hasCrm && (
                        <span className="text-[9px] bg-blue-200/70 text-blue-900 px-1 py-0.2 rounded font-semibold">CRM</span>
                      )}
                      {hasMngContracts && (
                        <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded font-bold">Договоры</span>
                      )}
                      {hasMngTickets && (
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-bold">Сервис</span>
                      )}
                      {hasMngLicenses && (
                        <span className="text-[9px] bg-blue-100 text-blue-900 px-1 py-0.2 rounded font-bold">Ключи</span>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      )}

      
      {/* Mobile Navigation Bar (< lg screens) */}
      <div className="lg:hidden bg-white dark:bg-slate-900 rounded-xl p-3 border-2 border-slate-200 dark:border-slate-700 shadow-md space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition-colors cursor-pointer min-h-[44px]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Menu className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">
                {
                  activeSubTab === 'contracts' ? 'Договоры и проекты' :
                  activeSubTab === 'licenses' ? 'Лицензии и ключи' :
                  activeSubTab === 'tickets' ? 'Техподдержка' :
                  activeSubTab === 'certificates' ? 'Свидетельства' :
                  activeSubTab === 'metrology-reports' ? 'Метрологические отчеты' :
                  activeSubTab === 'client-dashboard' ? 'Дашборд заказчика' :
                  activeSubTab === 'requests' ? 'Мои заявки' :
                  activeSubTab === 'guide' ? 'Регламенты и инструкции' :
                  activeSubTab === 'faq' ? 'База знаний и FAQ' :
                  activeSubTab === 'users' ? 'Пользователи' :
                  activeSubTab === 'email' ? 'Настройки почты' :
                  activeSubTab === 'notifications' ? 'Оповещения' :
                  activeSubTab === 'bot-settings' ? 'Онлайн-инженер' :
                  activeSubTab === 'assets' ? 'Медиа-активы' : 'Меню разделов'
                }
              </span>
            </div>
            <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ml-1">
              Меню
            </span>
          </button>

          {hasCrmAccess && (
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('ds_crm_active_tab', 'dashboard');
                navigateTo('crm');
              }}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs border-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[44px]"
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Открыть CRM</span>
            </button>
          )}
        </div>

        {/* Quick Horizontal Scroll Pills on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 touch-pan-x">
          {!hasCrmAccess && (
            <button
              type="button"
              onClick={() => handleSelectSubTab('docs', 'client-dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'client-dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Дашборд</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSelectSubTab('docs', 'contracts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'contracts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Договоры</span>
            {visibleContracts.length > 0 && (
              <span className={`text-[10px] px-1 rounded font-black ${activeSubTab === 'contracts' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
                {visibleContracts.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSelectSubTab('docs', 'licenses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'licenses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Лицензии</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectSubTab('docs', 'tickets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'tickets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Поддержка</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectSubTab('knowledge', 'guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'guide'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Регламенты</span>
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleSelectSubTab('admin', 'users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'users'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Пользователи</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Slide-Over Drawer (< lg screens) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-slate-50 h-full shadow-sm z-10 flex flex-col p-4 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3 bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  ДС
                </div>
                <div>
                  <h3 className="font-bold text-xs text-gray-900 leading-tight">{currentUser.fullName}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    {currentAccessInfo.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-slate-500 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AccountSidebarTree
              activeModule={activeModule}
              activeSubTab={activeSubTab}
              onSelectSubTab={handleSelectSubTab}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              hasCrmAccess={hasCrmAccess}
              isAdmin={isAdmin}
              canManageUsers={canManageUsers}
              canManageContracts={canManageContracts}
              canManageTickets={canManageTickets}
              canManageLicenses={canManageLicenses}
              canViewCertificates={canViewCertificates}
              canViewMetrologyReports={canViewMetrologyReports}
              contractsCount={visibleContracts.length}
              ticketsCount={visibleTickets.length}
              licensesCount={visibleLicenses.length}
              rfqsCount={visibleRfqs.length}
              dealsCount={deals.length}
              proposalsCount={(deals as any[]).filter(d => d.proposal || d.proposalId).length}
              fleetCount={fleetDevices?.length || 0}
              onItemClickMobile={() => setIsMobileDrawerOpen(false)}
              onNavigateToCrm={(tab) => {
                if (tab) sessionStorage.setItem('ds_crm_active_tab', tab);
                setIsMobileDrawerOpen(false);
                navigateTo('crm');
              }}
            />
          </div>
        </div>
      )}

      {/* Internal Staff Workspace Notice (Direct shortcut to full-screen CRM) */}
      {hasCrmAccess && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-2xl p-4 sm:p-5 border-2 border-blue-700/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-amber-300 shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full shadow-2xs">
                  Рабочая среда сотрудника
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  Оптимизированное рабочее место менеджеров и инженеров
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Оперативная CRM-система и Канбан-доски вынесены в отдельный рабочий центр
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Воронка сделок, реестр контрагентов, расчет ТКП, оперативные задачи и график поверок ФГИС «АРШИН» доступны в полноэкранном режиме с удобными широкими таблицами.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('ds_crm_active_tab', 'funnels');
                navigateTo('crm');
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Перейти в CRM-систему</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container: Desktop Sidebar + Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 mt-4 sm:mt-6 items-start">
        
        {/* Desktop Collapsible Accordion Sidebar (hidden on mobile, drawer is used instead) */}
        <div className="hidden lg:block shrink-0">
          <AccountSidebarTree
            activeModule={activeModule}
            activeSubTab={activeSubTab}
            onSelectSubTab={handleSelectSubTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            hasCrmAccess={hasCrmAccess}
            isAdmin={isAdmin}
            canManageUsers={canManageUsers}
            canManageContracts={canManageContracts}
            canManageTickets={canManageTickets}
            canManageLicenses={canManageLicenses}
            canViewCertificates={canViewCertificates}
            canViewMetrologyReports={canViewMetrologyReports}
            contractsCount={visibleContracts.length}
            ticketsCount={visibleTickets.length}
            licensesCount={visibleLicenses.length}
            rfqsCount={visibleRfqs.length}
            dealsCount={deals.length}
            proposalsCount={(deals as any[]).filter(d => d.proposal || d.proposalId).length}
            fleetCount={fleetDevices?.length || 0}
            onNavigateToCrm={(tab) => {
              if (tab) sessionStorage.setItem('ds_crm_active_tab', tab);
              navigateTo('crm');
            }}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full flex flex-col gap-6">
          
          {/* Clean Top Header Bar: Breadcrumb + Action Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="hover:text-blue-600 transition-colors">
                  {activeModule === 'docs' ? (hasCrmAccess ? 'Служебные реестры и Сервис' : 'Личный кабинет заказчика') :
                   activeModule === 'knowledge' ? (hasCrmAccess ? 'Служебные инструкции и регламенты' : 'Помощь и поддержка') : 'Администрирование системы'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-blue-700 dark:text-blue-400 font-black">
                  {activeSubTab === 'contracts' ? 'Договоры и проекты' :
                   activeSubTab === 'licenses' ? 'Лицензии и ключи ПО' :
                   activeSubTab === 'tickets' ? 'Заявки в техподдержку' :
                   activeSubTab === 'certificates' ? 'Свидетельства и сертификаты' :
                   activeSubTab === 'metrology-reports' ? 'Реестр метрологических отчетов' :
                   activeSubTab === 'client-dashboard' ? 'Дашборд заказчика' :
                   activeSubTab === 'requests' ? 'Мои заявки и расчеты' :
                   activeSubTab === 'staff-guide' ? 'Инструкции для специалистов' :
                   activeSubTab === 'guide' ? 'Руководство пользователя' :
                   activeSubTab === 'faq' ? 'Вопросы и ответы (FAQ)' :
                   activeSubTab === 'users' ? 'Пользователи и права (RBAC)' :
                   activeSubTab === 'email' ? 'Настройки почты (SMTP)' :
                   activeSubTab === 'logs' ? 'Журнал безопасности и логи' : activeSubTab}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeSubTab === 'contracts' ? 'Реестр договоров и проектов' :
                 activeSubTab === 'licenses' ? 'Лицензии и аппаратные ключи защиты' :
                 activeSubTab === 'tickets' ? 'Реестр заявок в службу технической поддержки' :
                 activeSubTab === 'certificates' ? 'Реестр свидетельств и сертификатов' :
                 activeSubTab === 'metrology-reports' ? 'Реестр метрологических отчетов' :
                 activeSubTab === 'client-dashboard' ? 'Сводный дашборд заказчика' :
                 activeSubTab === 'requests' ? 'Мои расчеты стоимости и заявки' :
                 activeSubTab === 'staff-guide' ? 'Служебные инструкции и регламенты кабинета' :
                 activeSubTab === 'guide' ? 'Руководство пользователя личного кабинета' :
                 activeSubTab === 'faq' ? 'Часто задаваемые вопросы (B2B FAQ)' :
                 activeSubTab === 'users' ? 'Управление учетными записями и правами доступа (RBAC)' :
                 activeSubTab === 'email' ? 'Конфигурация корпоративного SMTP сервера' :
                 activeSubTab === 'logs' ? 'Системный журнал событий и аудит действий' : 'Раздел личного кабинета'}
              </h2>
            </div>

          </div>

          {/* Admin B2B Portal Notice */}
          {hasCrmAccess && activeModule === 'docs' && (
            <div className="p-3.5 sm:p-4 mb-4 rounded-xl bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-start sm:items-center gap-2.5 text-blue-950 dark:text-blue-100 min-w-0">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <span className="font-black text-blue-900 dark:text-blue-200">Режим служебных реестров:</span>
                  <span className="text-slate-600 dark:text-slate-300 ml-1">
                    Вы просматриваете служебные реестры договоров, лицензий и сервисных заявок. Для работы со сделками и воронкой продаж перейдите в CRM.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('ds_crm_active_tab', 'dashboard');
                  navigateTo('crm');
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-xs flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Единая среда CRM</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {/* Specific module renders */}
          {activeModule === 'admin' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeSubTab === 'users' && <UserManagementPanel />}
              {activeSubTab === 'email' && <UnifiedCommunicationsHub contextMode="account" initialTab="smtp" />}
              {activeSubTab === 'logs' && <CrmRealtimeLogsView />}
            </div>
          )}

          {activeModule === 'knowledge' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              {/* If user is Staff/Manager: Show dedicated Staff Cabinet Manual */}
              {hasCrmAccess ? (
                <StaffCabinetManualView />
              ) : (
                /* If user is Client: Show ONLY Client-Safe Guide and FAQ */
                <>
                  {/* B2B Client Portal Guide */}
                  {activeSubTab === 'guide' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            Руководство пользователя личного кабинета ООО «ДС-Инжиниринг»
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Инструкции по работе с договорами, электронными ключами ПО и сервисными заявками
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Section 1 */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                            <Briefcase className="w-4 h-4" />
                            <span>1. Договоры и проекты</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Отслеживание статуса поставок и услуг</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            В разделе «Договоры и проекты» вы можете просматривать спецификации оборудования, текущие этапы исполнения, календарные графики отгрузок и сопутствующие документы.
                          </p>
                        </div>

                        {/* Section 2 */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider">
                            <KeyRound className="w-4 h-4" />
                            <span>2. Лицензии и ПО</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Управление ключами Geomagic / PolyWorks</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Здесь хранятся номера аппаратных USB-ключей (Dongle ID), файлы лицензий `.lic` и ссылки на загрузку официальных дистрибутивов PolyWorks|Inspector, Geomagic и TopSolid.
                          </p>
                        </div>

                        {/* Section 3 */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                            <MessageSquare className="w-4 h-4" />
                            <span>3. Техническая поддержка</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Подача сервисных заявок и консультаций</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Для решения вопросов по калибровке КИМ, вызову сервисного инженера или настройке ПО создайте новое обращение в разделе «Техподдержка».
                          </p>
                        </div>

                        {/* Section 4 */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                            <ClipboardCheck className="w-4 h-4" />
                            <span>4. Метрология и Сертификаты</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Протоколы измерений и ФГИС «АРШИН»</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Загружайте официальные протоколы контроля геометрических параметров (GD&T) и проверяйте номера поверок вашего оборудования в государственном реестре ФГИС «АРШИН».
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'faq' && <ClientFaqSection />}
                </>
              )}
            </div>
          )}

          {activeModule === 'docs' && activeSubTab === 'certificates' && (hasCrmAccess || canViewCertificates) && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CertificatesRegistry />
            </div>
          )}

          {activeModule === 'docs' && activeSubTab === 'metrology-reports' && (hasCrmAccess || canViewMetrologyReports) && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <MetrologyReportsRegistry />
            </div>
          )}

          {activeModule === 'docs' && activeSubTab === 'client-dashboard' && !hasCrmAccess && currentUser && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ClientDashboard 
                currentUser={currentUser}
                onCreateTicket={() => {
                  setEditingTicket(null);
                  setTicketModalOpen(true);
                }}
                onOpenRfqModal={() => setIsNewRfqModalOpen(true)}
                onNavigateToSubTab={(subTab) => handleSelectSubTab('docs', subTab)}
              />
            </div>
          )}

          {/* TAB: MY REQUESTS & RFQs */}
          {/* ------------------------------------------------------------- */}
          {activeModule === 'docs' && activeSubTab === 'requests' && !hasCrmAccess && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Мои заявки и расчеты стоимости</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Отслеживание статусов коммерческих предложений, калькуляций и заявок на инженерные услуги
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('services')}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    <span>Услуги и расчет</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewRfqModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Новая заявка на расчет</span>
                  </button>
                </div>
              </div>

              {(!rfqs || rfqs.length === 0) ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">У вас пока нет активных заявок</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      Создайте новую заявку на расчет стоимости проекта, внедрение ПО или поставку оборудования, либо воспользуйтесь интерактивным калькулятором.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNewRfqModalOpen(true)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Подать заявку на расчет ТКП</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('services')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Calculator className="w-4 h-4 text-emerald-600" />
                      <span>Инженерные услуги и расчет</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {rfqs.map((r, idx) => (
                    <div key={r.id ? `${r.id}-${idx}` : `rfq-${idx}`} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                            {r.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {new Date(r.createdAt || Date.now()).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                          {r.serviceType === 'software' ? 'Заявка на ПО' : 
                           r.serviceType === 'demo' ? 'Заказ демонстрации' : 
                           r.serviceType === 'consultation' ? 'Консультация инженера' : 
                           r.serviceType}
                        </h3>
                        {r.details && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-2xl">{r.details}</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <span
                          className={`px-4 py-1.5 text-xs font-semibold rounded-lg border ${
                            r.status === 'completed' || r.status === 'closed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : r.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {r.status === 'completed' || r.status === 'closed'
                            ? 'Завершено'
                            : r.status === 'in_progress'
                            ? 'В работе'
                            : 'На рассмотрении'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: CONTRACTS & PROJECTS (WITH FULL FILE MANAGEMENT) */}
      {/* ------------------------------------------------------------- */}
      {activeModule === 'docs' && activeSubTab === 'contracts' && (
        <ContractsRegistry contracts={visibleContracts} setContracts={setContracts} deals={deals} />
      )}

      {activeModule === 'docs' && activeSubTab === 'tickets' && (
        <SupportRegistry supportTickets={visibleTickets} setEditingTicket={setEditingTicket} setTicketModalOpen={setTicketModalOpen} />
      )}

      {activeModule === 'docs' && activeSubTab === 'licenses' && (
        <LicensesRegistry
          licenses={visibleLicenses.map(lic => ({
            ...lic,
            seats: lic.seatsCount,
            server: lic.licenseServer,
            hardware: lic.hardwareModel || 'Не применимо',
            supportExpiry: lic.supportUntil,
            description: lic.notes || ''
          }))}
          canManageLicenses={canManageLicenses}
          onAdd={() => { setEditingLicense(null); setLicenseModalOpen(true); }}
          onRequestSupportExtension={(lic) => {
            const product = lic.title || 'ПО САПР/КИМ';
            const haspInfo = lic.haspId ? ` [HASP/Ключ: ${lic.haspId}]` : '';
            const newReqTicket: SupportTicketItem = {
              id: `req-ext-${Date.now()}`,
              subject: `Запрос продления техподдержки: ${product}${haspInfo}`,
              product: (lic.title || '').toLowerCase().includes('polyworks') ? 'PolyWorks' : (lic.title || '').toLowerCase().includes('topsolid') ? 'TopSolid 7' : 'TopSolid 7',
              clientCompany: currentUser?.company || 'Заказчик',
              clientName: currentUser?.fullName || 'Представитель предприятия',
              date: new Date().toISOString().slice(0, 10),
              status: 'open',
              priority: 'Высокий',
              description: `Запрос продления техподдержки для лицензии «${lic.title}». HASP ID: ${lic.haspId || 'не указан'}. Текущий срок поддержки: ${lic.supportUntil || 'истекает'}.`,
              assignedEngineer: 'Скобелев Александр Сергеевич (TopSolid / Постпроцессоры)',
              messages: [
                {
                  id: `msg-${Date.now()}`,
                  author: currentUser?.fullName || 'Представитель предприятия',
                  authorRole: 'client',
                  date: new Date().toLocaleString('ru-RU'),
                  text: `Прошу подготовить коммерческое предложение и счет на продление технической поддержки и обновлений для лицензии «${lic.title}» (HASP ID: ${lic.haspId || 'не указан'}, текущий срок: ${lic.supportUntil || 'истекает'}).`,
                }
              ],
              attachments: []
            };
            setEditingTicket(newReqTicket);
            setTicketModalOpen(true);
            showToast(`Форма запроса продления для «${lic.title}» подготовлена`);
          }}
          onEdit={(lic) => { 
            const orig = licenses.find(l => l.id === lic.id);
            setEditingLicense(orig || null); 
            setLicenseModalOpen(true); 
          }}
          onDelete={(id, e) => handleDeleteLicense(id, e)}
          renderAdditionalDetails={(lic) => {
            const origLic = licenses.find(l => l.id === lic.id);
            if (!origLic) return null;
            return (
                  <div className="pt-2 border-t border-gray-100 space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                        <span>Файлы лицензий и дампы ({origLic.files?.length || 0}):</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachFileTarget({
                            type: 'license',
                            entityId: origLic.id,
                            entityTitle: `Лицензия: ${origLic.title}`
                          });
                        }}
                        className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить</span>
                      </button>
                    </div>
                    {(!origLic.files || origLic.files.length === 0) ? (
                      <p className="text-xs text-gray-400 italic">Файлы не прикреплены.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {origLic.files.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between bg-teal-50/50 p-2 rounded-xl border border-teal-200 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingDocState({
                                    doc: f,
                                    parentTitle: `Лицензия: ${origLic.title}`,
                                    entityNumber: origLic.haspId
                                  });
                                }}
                                className="font-semibold text-gray-800 hover:text-teal-800 truncate text-left cursor-pointer"
                                title={f.name}
                              >
                                {f.name}
                              </button>
                              <span className="text-[10px] text-gray-400 font-mono">({f.size})</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingDocState({
                                  doc: f,
                                  parentTitle: `Лицензия: ${origLic.title}`,
                                  entityNumber: origLic.haspId
                                });
                              }}
                              className="p-1 text-teal-700 hover:text-teal-900 hover:bg-teal-100 rounded cursor-pointer"
                              title="Просмотр и скачивание"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
            );
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: CLOSED EMPLOYEE KNOWLEDGE BASE & WORKFLOW REGULATIONS */}
      {/* ------------------------------------------------------------- */}
      


      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* Contract Modal */}
              </main>
      </div>

      {contractModalOpen && (
        <AccountContractModal
          contract={editingContract}
          onClose={() => setContractModalOpen(false)}
          onSave={handleSaveContract}
        />
      )}

      {/* Support Ticket Modal */}
      {ticketModalOpen && (
        <AccountTicketModal
          ticket={editingTicket}
          canManage={canManageTickets}
          currentUser={currentUser}
          onClose={() => setTicketModalOpen(false)}
          onSave={handleSaveTicket}
        />
      )}

      {/* License Modal */}
      {licenseModalOpen && (
        <AccountLicenseModal
          license={editingLicense}
          onClose={() => setLicenseModalOpen(false)}
          onSave={handleSaveLicense}
        />
      )}

      {/* Direct File Attachment Modal */}
      {attachFileTarget && (
        <AccountFileModal
          parentTitle={attachFileTarget.entityTitle}
          defaultCategories={
            attachFileTarget.type === 'contract'
              ? ['Договор и приложения', 'Спецификация и смета', 'Акт сдачи-приемки', 'Паспорт и сертификат']
              : attachFileTarget.type === 'license'
              ? ['Файл лицензии (.v2c / .lic)', 'Дамп ключа защиты HASP', 'Драйвер ключа / Утилита']
              : ['Лог ошибки / Скриншот', 'CAD-модель / Чертеж', 'Файл постпроцессора']
          }
          onClose={() => setAttachFileTarget(null)}
          onSave={handleSaveDirectFile}
        />
      )}

      {/* Document Viewer Modal */}
      {viewingDocState && (
        <AccountDocViewerModal
          document={viewingDocState.doc}
          parentTitle={viewingDocState.parentTitle}
          parentEntityNumber={viewingDocState.entityNumber}
          onClose={() => setViewingDocState(null)}
          canDelete={false}
        />
      )}

      {/* Profile Photo Modal */}
      {isPhotoModalOpen && currentUser && (
        <ProfilePhotoModal
          isOpen={isPhotoModalOpen}
          user={currentUser}
          onClose={() => setIsPhotoModalOpen(false)}
          onSavePhoto={(newAvatarUrl) => {
            updateUser(currentUser.id, { avatar: newAvatarUrl });
            showToast('Фотография профиля успешно обновлена');
            return true;
          }}
        />
      )}

      {/* Client RFQ Calculation Modal */}
      {isNewRfqModalOpen && (
        <ClientRfqModal
          currentUser={currentUser}
          onClose={() => setIsNewRfqModalOpen(false)}
          onSuccess={(newRfq) => {
            setRfqs(prev => [newRfq, ...prev]);
            showToast('Заявка на расчет успешно отправлена в коммерческий отдел!');
          }}
        />
      )}
    </div>
  );
};

export default AccountPage;

