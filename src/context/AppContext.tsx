import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  PageId, 
  Product, 
  Article, 
  KnowledgeItem, 
  ServiceItem, 
  CustomPage,
  UserProfile,
  AuthAccount,
  UserPermissions,
  getUserPermissions,
  DEFAULT_ROLE_PERMISSIONS,
  ProjectContract, TrainingCertificate, MetrologyReport, CompanyFleetDevice,
  CommercialProposal,
  SupportTicketItem,
  LicenseItem,
  SYSTEM_PAGE_IDS,
  Model3DItem,
  TextConstantItem,
  NavigationHistoryItem
} from '../types';
import { getSoftwareCategoryLabel, getHardwareCategoryLabel, getKnowledgeCategoryLabel, getPageTitle } from '../utils/navigationLabels';
import { DEFAULT_3D_MODELS } from '../data/default3dModels';
import { 
  PRODUCTS_DATA, 
  SERVICES_DATA, 
  NEWS_ARTICLES, 
  KNOWLEDGE_BASE_ITEMS, 
  COMPANY_INFO, 
  DEPARTMENTS_CONTACTS,
  DEFAULT_ADMIN_ACCOUNTS,
  DEFAULT_CLIENT_ACCOUNTS
} from '../data/mockData';
import { DEFAULT_SITE_TEXTS, SiteTextsData } from '../data/defaultSiteTexts';
import {
  ExtendedDeal,
  INITIAL_CRM_DEALS,
  INITIAL_LICENSES, INITIAL_SUPPORT_TICKETS,
  INITIAL_CONTRACTS,
  INITIAL_PROPOSALS,
  INITIAL_COMPANY_FLEET,
  CrmTaxSettings,
  DEFAULT_CRM_TAX_SETTINGS
} from '../data/mockCrmData';
import { apiService } from '../services/apiService';
import { fetchWithCsrf } from '../services/csrfService';
import { parseCurrentLocation, updateBrowserUrl, getRoutePath } from '../utils/routes';
import { useTheme } from './ThemeContext';

export interface ContactModalConfig {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  defaultProduct?: string;
  defaultService?: string;
  customMessage?: string;
  formType: 'consultation' | 'demo' | 'quote' | 'service' | 'postprocessor' | 'general' | 'question' | 'request' | 'trial' | 'brochure' | 'consult' | 'measurement';
  camSystem?: string;
  isLicensedCam?: boolean;
}

import { DEFAULT_SYSTEM_PAGES } from '../data/defaultPages';

const DEFAULT_CUSTOM_PAGES: CustomPage[] = DEFAULT_SYSTEM_PAGES;

interface AppContextType {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  navigateTo: (page: PageId, detailId?: string, skipHistory?: boolean) => void;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  
  // Custom Pages (CMS)
  customPages: CustomPage[];
  addCustomPage: (page: CustomPage) => void;
  updateCustomPage: (id: string, page: Partial<CustomPage>) => void;
  deleteCustomPage: (id: string) => void;

  // Products CRUD
  products: Product[];
  addProduct: (prod: Product) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Services CRUD
  services: ServiceItem[];
  addService: (service: ServiceItem) => void;
  updateService: (id: string, service: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  // Articles & Knowledge CRUD
  articles: Article[];
  addArticle: (art: Article) => void;
  updateArticle: (id: string, art: Partial<Article>) => void;
  deleteArticle: (id: string) => void;

  knowledgeBase: KnowledgeItem[];
  addKnowledgeItem: (item: KnowledgeItem) => void;
  updateKnowledgeItem: (id: string, item: Partial<KnowledgeItem>) => void;
  deleteKnowledgeItem: (id: string) => void;

  // Company Info & Contacts
  companyInfo: typeof COMPANY_INFO;
  updateCompanyInfo: (info: Partial<typeof COMPANY_INFO>) => void;

  // Global Site Text Constants (Database Driven from PostgreSQL text_constants)
  siteTexts: SiteTextsData;
  textConstants: Record<string, string>;
  textConstantsRecords: TextConstantItem[];
  textConstantsLoading: boolean;
  textConstantsSource: string;
  getText: (key: string, fallback?: string) => string;
  refreshTextConstants: () => Promise<void>;
  updateTextConstant: (key: string, value: string, description?: string) => Promise<boolean>;
  updateSiteTexts: (texts: Partial<SiteTextsData>) => Promise<boolean>;
  resetSiteTexts: () => Promise<boolean>;
  importSiteTexts: (texts: Partial<SiteTextsData>) => Promise<boolean>;

  // CMS Import/Export/Reset
  exportAllDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  resetToDefaultData: () => void;
  resetCrmDatabase: () => Promise<boolean>;

  // 3D WebGL Inspection Models Management
  models3D: Model3DItem[];
  setModels3D: React.Dispatch<React.SetStateAction<Model3DItem[]>>;
  addModel3D: (model: Partial<Model3DItem>) => Promise<boolean>;
  updateModel3D: (id: string, updates: Partial<Model3DItem>) => Promise<boolean>;
  deleteModel3D: (id: string) => Promise<boolean>;
  resetModels3D: () => Promise<boolean>;

  // Selected detail states
  selectedProduct: Product | null;
  setSelectedProduct: (prod: Product | null) => void;
  selectedArticle: Article | null;
  setSelectedArticle: (art: Article | null) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;
  selectedKnowledgeItem: KnowledgeItem | null;
  setSelectedKnowledgeItem: (item: KnowledgeItem | null) => void;
  selectedKnowledgeCategory: string | null;
  setSelectedKnowledgeCategory: (cat: string | null) => void;

  // User Navigation History
  navigationHistory: NavigationHistoryItem[];
  addToNavigationHistory: (item: Omit<NavigationHistoryItem, 'id' | 'timestamp'> & { timestamp?: number }) => void;
  clearNavigationHistory: () => void;

  // Comparison
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareDrawerOpen: boolean;
  setIsCompareDrawerOpen: (open: boolean) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Global search modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Contact / Demo / Quote Modal
  contactModal: ContactModalConfig;
  openContactModal: (config?: Partial<ContactModalConfig>) => void;
  closeContactModal: () => void;

  // Quick Callback Modal
  isCallbackModalOpen: boolean;
  callbackInitialData?: { topic?: string; phone?: string; name?: string };
  openCallbackModal: (initialData?: { topic?: string; phone?: string; name?: string }) => void;
  closeCallbackModal: () => void;

  // Metrology Equipment Configurator Modal
  isConfiguratorModalOpen: boolean;
  setIsConfiguratorModalOpen: (open: boolean) => void;
  openConfiguratorModal: () => void;
  closeConfiguratorModal: () => void;

  // B2B ROI Calculator Modal (Test Access / Beta)
  isRoiCalculatorModalOpen: boolean;
  setIsRoiCalculatorModalOpen: (open: boolean) => void;
  openRoiCalculatorModal: () => void;
  closeRoiCalculatorModal: () => void;

  // Auth & Roles
  currentUser: UserProfile | null;
  authUsers: AuthAccount[];
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  register: (account: { fullName: string; email: string; phone: string; company: string; position: string; password?: string }) => Promise<boolean>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userPermissions: UserPermissions;
  createUser: (account: Omit<AuthAccount, 'id'>) => boolean;
  updateUser: (id: string, updates: Partial<AuthAccount>) => boolean;
  deleteUser: (id: string) => boolean;
  updateUserPermissions: (id: string, permissions: Partial<UserPermissions>) => boolean;

  // Contracts & Projects
  contracts: ProjectContract[];
  certificates: TrainingCertificate[];
  metrologyReports: MetrologyReport[];
  fleetDevices: CompanyFleetDevice[];
  setContracts: React.Dispatch<React.SetStateAction<ProjectContract[]>>;
  setCertificates: React.Dispatch<React.SetStateAction<TrainingCertificate[]>>;
  setMetrologyReports: React.Dispatch<React.SetStateAction<MetrologyReport[]>>;
  setFleetDevices: React.Dispatch<React.SetStateAction<CompanyFleetDevice[]>>;
  addContract: (contract: ProjectContract) => void;
  updateContract: (id: string, updates: Partial<ProjectContract>) => void;
  deleteContract: (id: string) => void;
  addFleetDevice: (device: CompanyFleetDevice) => Promise<boolean>;
  updateFleetDevice: (id: string, updates: Partial<CompanyFleetDevice>) => Promise<boolean>;
  deleteFleetDevice: (id: string) => Promise<boolean>;

  // Commercial Proposals
  commercialProposals: CommercialProposal[];
  setCommercialProposals: React.Dispatch<React.SetStateAction<CommercialProposal[]>>;
  addCommercialProposal: (proposal: CommercialProposal) => void;
  updateCommercialProposal: (id: string, updates: Partial<CommercialProposal>) => void;
  deleteCommercialProposal: (id: string) => void;
  documentDetailLevel: 'express' | 'standard' | 'complex_project' | 'engineering_opk';
  setDocumentDetailLevel: (level: 'express' | 'standard' | 'complex_project' | 'engineering_opk') => void;

  // Deals & Funnels
  funnels: any[];
  setFunnels: React.Dispatch<React.SetStateAction<any[]>>;
  updateFunnelStages: (funnelId: string, stages: any[]) => Promise<void>;
  resetFunnelsToDefault: () => Promise<void>;
  crmSettings: CrmTaxSettings;
  updateCrmSettings: (updates: Partial<CrmTaxSettings>) => Promise<void>;
  deals: ExtendedDeal[];
  setDeals: React.Dispatch<React.SetStateAction<ExtendedDeal[]>>;
  addDeal: (deal: ExtendedDeal) => void;
  updateDeal: (id: string, updates: Partial<ExtendedDeal>) => void;
  deleteDeal: (id: string) => void;

  // Support Tickets
  supportTickets: SupportTicketItem[];
  setSupportTickets: React.Dispatch<React.SetStateAction<SupportTicketItem[]>>;
  addSupportTicket: (ticket: SupportTicketItem) => void;
  updateSupportTicket: (id: string, updates: Partial<SupportTicketItem>) => void;
  deleteSupportTicket: (id: string) => void;

  // Licenses
  licenses: LicenseItem[];
  setLicenses: React.Dispatch<React.SetStateAction<LicenseItem[]>>;
  addLicense: (license: LicenseItem) => void;
  updateLicense: (id: string, updates: Partial<LicenseItem>) => void;
  deleteLicense: (id: string) => void;

  // Theme management (light/dark mode)
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // 152-FZ Privacy Policy Modal
  isPrivacyModalOpen: boolean;
  setIsPrivacyModalOpen: (open: boolean) => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string, type?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[APP_BOOT] [AppProvider] AppProvider component initializing...');
  const [authUsers, setAuthUsers] = useState<AuthAccount[]>([]);

  useEffect(() => {
    console.log('[APP_BOOT] [AppProvider] Mounted. Fetching auth users...');
    apiService.getUsers().then(res => {
      console.log('[APP_BOOT] [AppProvider] Users API response received:', res.success ? 'SUCCESS' : 'FAILED');
      if (res.success && res.data) {
        setAuthUsers(res.data);
      }
    }).catch(err => {
      console.warn('[APP_BOOT] [AppProvider] Users API fetch error (non-fatal fallback active):', err);
    });
  }, []);


  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('ds_current_user_v3');
      if (saved) {
        const user: UserProfile = JSON.parse(saved);
        return {
          ...user,
          permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || DEFAULT_ROLE_PERMISSIONS.client,
        };
      }
      // По умолчанию авторизован аккаунт Генерального директора (adm-01, Некрасов Сергей Юрьевич)
      const genDirector = DEFAULT_ADMIN_ACCOUNTS[0];
      return {
        id: genDirector.id,
        email: genDirector.email,
        fullName: genDirector.fullName,
        role: genDirector.role,
        position: genDirector.position,
        company: genDirector.company,
        phone: genDirector.phone,
        contractNumber: genDirector.contractNumber,
        avatar: genDirector.avatar,
        permissions: genDirector.permissions || DEFAULT_ROLE_PERMISSIONS.superadmin,
      };
    } catch {
      const genDirector = DEFAULT_ADMIN_ACCOUNTS[0];
      return {
        id: genDirector.id,
        email: genDirector.email,
        fullName: genDirector.fullName,
        role: genDirector.role,
        position: genDirector.position,
        company: genDirector.company,
        phone: genDirector.phone,
        contractNumber: genDirector.contractNumber,
        avatar: genDirector.avatar,
        permissions: genDirector.permissions || DEFAULT_ROLE_PERMISSIONS.superadmin,
      };
    }
  });

  // Always load canonical user accounts and RBAC permissions from PostgreSQL Database on startup
  useEffect(() => {
    let isMounted = true;
    const loadUsersFromDatabase = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            if (isMounted) {
              const dbUsers: AuthAccount[] = json.data.map((u: any) => ({
                ...u,
                permissions: u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role as 'superadmin' | 'admin' | 'moderator' | 'manager' | 'client'] || DEFAULT_ROLE_PERMISSIONS.client,
              }));
              setAuthUsers(dbUsers);

              // If current user is logged in, refresh current user permissions and data from DB
              setCurrentUser((prev) => {
                if (!prev) return null;
                const matching = dbUsers.find(
                  (u) => (u.id && prev.id && u.id === prev.id) || (Boolean(u.email && prev.email) && u.email.toLowerCase() === prev.email.toLowerCase())
                );
                if (matching) {
                  const freshPerms = getUserPermissions(matching);
                  return {
                    ...prev,
                    ...matching,
                    permissions: freshPerms,
                  };
                }
                return prev;
              });
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch users from database API, fallback to local store:', err);
      }
    };

    loadUsersFromDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      // no-op
    } catch {}
  }, [authUsers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ds_current_user_v3', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('ds_current_user_v3');
      }
    } catch {}
  }, [currentUser]);

  // Keep logged-in user permissions synchronized whenever authUsers are updated by admin
  useEffect(() => {
    if (!currentUser) return;
    const matchingAuth = authUsers.find(
      (u) => (u.id && currentUser.id && u.id === currentUser.id) || (Boolean(u.email && currentUser.email) && u.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    if (matchingAuth) {
      const freshPerms = getUserPermissions(matchingAuth);
      const curPerms = getUserPermissions(currentUser);
      if (JSON.stringify(freshPerms) !== JSON.stringify(curPerms)) {
        setCurrentUser((prev) => (prev ? { ...prev, permissions: freshPerms } : null));
      }
    }
  }, [authUsers, currentUser]);

  const userPermissions = useMemo(() => {
    return getUserPermissions(currentUser);
  }, [currentUser]);

  const initialRoute = useMemo(() => {
    return typeof window !== 'undefined' ? parseCurrentLocation() : { page: 'home' as PageId };
  }, []);

  const [currentPage, setCurrentPage] = useState<PageId>(initialRoute.page);
  const [activeCategory, setActiveCategory] = useState<string | null>(() => {
    if (initialRoute.page === 'software' && initialRoute.detailId) {
      const lower = initialRoute.detailId.toLowerCase();
      if (['all', 'topsolid', 'polyworks', 'geomagic', 'shining3d', 'shining3d-sw'].includes(lower)) {
        return lower;
      }
    }
    return null;
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    if (initialRoute.detailId && (initialRoute.page === 'software' || initialRoute.page === 'hardware')) {
      const lower = initialRoute.detailId.toLowerCase();
      // If it's a category slug, don't set selectedProduct
      if (initialRoute.page === 'software' && ['all', 'topsolid', 'polyworks', 'geomagic', 'shining3d', 'shining3d-sw'].includes(lower)) {
        return null;
      }
      return PRODUCTS_DATA.find((p) => p.id.toLowerCase() === lower) || null;
    }
    return null;
  });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() => {
    if (initialRoute.detailId && initialRoute.page === 'news') {
      return NEWS_ARTICLES.find((a) => a.id.toLowerCase() === initialRoute.detailId?.toLowerCase()) || null;
    }
    return null;
  });
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(() => {
    if (initialRoute.detailId && initialRoute.page === 'services') {
      return initialRoute.detailId;
    }
    return null;
  });
  const [selectedKnowledgeItem, setSelectedKnowledgeItem] = useState<KnowledgeItem | null>(null);
  const [selectedKnowledgeCategory, setSelectedKnowledgeCategory] = useState<string | null>(null);

  // User Navigation History (Persisted in localStorage across user visits)
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ds_nav_history_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const addToNavigationHistory = useCallback((item: Omit<NavigationHistoryItem, 'id' | 'timestamp'> & { timestamp?: number }) => {
    setNavigationHistory((prev) => {
      const now = item.timestamp || Date.now();
      const newItem: NavigationHistoryItem = {
        ...item,
        id: `hist-${now}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now,
      };
      // Deduplicate: filter out entries with identical target
      const filtered = prev.filter(
        (p) => !(p.page === item.page && p.detailId === item.detailId && p.category === item.category && p.title === item.title)
      );
      const next = [newItem, ...filtered].slice(0, 20);
      try {
        localStorage.setItem('ds_nav_history_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearNavigationHistory = useCallback(() => {
    setNavigationHistory([]);
    try {
      localStorage.removeItem('ds_nav_history_v2');
    } catch {}
  }, []);

  // Unified Theme state from ThemeContext
  const { theme, setTheme, toggleTheme } = useTheme();

  // Dynamic CMS state from localStorage or mockData
  const [customPages, setCustomPages] = useState<CustomPage[]>(() => {
    try {
      const saved = localStorage.getItem('ds_cms_pages');
      if (saved) {
        const parsed: CustomPage[] = JSON.parse(saved);
        const filtered = parsed.filter((p) => p.id !== 'custom-training-center');
        const existingIds = new Set(filtered.map(p => p.id));
        const missingSystem = DEFAULT_SYSTEM_PAGES.filter(p => !existingIds.has(p.id));
        // If an existing system page has the old dummy stub with 2 blocks, upgrade to authentic content; ensure system pages do not duplicate in custom pages header
        const upgraded = filtered.map(p => {
          const sys = DEFAULT_SYSTEM_PAGES.find(s => s.id === p.id);
          const isSystem = SYSTEM_PAGE_IDS.has(p.id);
          if (sys && (!p.blocks || (p.blocks.length <= 2 && p.blocks[0]?.id?.startsWith('hero-')))) {
            return { ...sys, showInHeader: false, showInFooter: false };
          }
          if (isSystem) {
            return { ...p, showInHeader: false, showInFooter: false };
          }
          return p;
        });
        const sanitizedMissing = missingSystem.map(p => ({ ...p, showInHeader: false, showInFooter: false }));
        return [...upgraded, ...sanitizedMissing];
      }
      return DEFAULT_CUSTOM_PAGES;
    } catch {
      return DEFAULT_CUSTOM_PAGES;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ds_cms_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Replace mock items with the up-to-date PRODUCTS_DATA items to ensure newly added mock products (like shining3d-inspect) and updated specs/images are current, while keeping user-added custom products
        const standardIds = new Set(PRODUCTS_DATA.map((p) => p.id));
        const customItems = parsed.filter((p) => !standardIds.has(p.id) && p.id !== 'geomagic-wrap');
        return [...PRODUCTS_DATA, ...customItems];
      }
      return PRODUCTS_DATA;
    } catch {
      return PRODUCTS_DATA;
    }
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('ds_cms_services');
      if (saved) {
        const parsed: ServiceItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored cache has outdated equipment-supply or old cmm-service id, sanitize and reset to canonical standard
          const hasStaleOrInvalidData = 
            parsed.some(s => s.id === 'equipment-supply' || s.id === 'cmm-service') ||
            parsed.length !== SERVICES_DATA.length;
          if (hasStaleOrInvalidData) {
            localStorage.setItem('ds_cms_services', JSON.stringify(SERVICES_DATA));
            return SERVICES_DATA;
          }
          const parsedMap = new Map(parsed.map((s) => [s.id, s]));
          const merged = SERVICES_DATA.map((s) => parsedMap.get(s.id) || s);
          return merged;
        }
      }
      return SERVICES_DATA;
    } catch {
      return SERVICES_DATA;
    }
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('ds_cms_articles');
      if (saved) {
        const parsed: Article[] = JSON.parse(saved);
        // If it's the old 3 articles, override with the new full list
        if (parsed.length < 12) {
          return NEWS_ARTICLES;
        }
        const existingIds = new Set(parsed.map(a => a.id));
        const newArticles = NEWS_ARTICLES.filter(a => !existingIds.has(a.id));
        return [...newArticles, ...parsed];
      }
    } catch {
      // ignore
    }
    return NEWS_ARTICLES;
  });

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>(() => {
    try {
      const saved = localStorage.getItem('ds_cms_knowledge');
      if (saved) {
        const parsedSaved: KnowledgeItem[] = JSON.parse(saved);
        const existingIds = new Set(parsedSaved.map(item => item.id));
        const newItems = KNOWLEDGE_BASE_ITEMS.filter(item => !existingIds.has(item.id));
        return [...parsedSaved, ...newItems];
      }
      return KNOWLEDGE_BASE_ITEMS;
    } catch {
      return KNOWLEDGE_BASE_ITEMS;
    }
  });

  const [companyInfo, setCompanyInfo] = useState<typeof COMPANY_INFO>(() => {
    try {
      const saved = localStorage.getItem('ds_cms_company');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.workHours?.includes('08:30') || !parsed.workHours) {
          parsed.workHours = COMPANY_INFO.workHours;
        }
        return { ...COMPANY_INFO, ...parsed };
      }
      return COMPANY_INFO;
    } catch {
      return COMPANY_INFO;
    }
  });

  // Helper to build a flat dictionary from SiteTextsData
  const buildDictionaryFromSiteTexts = (data: SiteTextsData): Record<string, string> => {
    const dict: Record<string, string> = {};
    const categories: Array<keyof SiteTextsData> = ['home', 'about', 'contacts', 'services', 'catalogs', 'footer'];
    for (const cat of categories) {
      const sec = data[cat];
      if (sec && typeof sec === 'object') {
        for (const [k, v] of Object.entries(sec)) {
          if (typeof v === 'string') {
            dict[`${cat}.${k}`] = v;
          }
        }
      }
    }
    return dict;
  };

  // Global Site Text Constants State (Database Driven from PostgreSQL 'text_constants')
  const [siteTexts, setSiteTexts] = useState<SiteTextsData>(() => {
    try {
      const saved = localStorage.getItem('ds_site_texts');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SITE_TEXTS,
          ...parsed,
          home: { ...DEFAULT_SITE_TEXTS.home, ...(parsed.home || {}) },
          about: { ...DEFAULT_SITE_TEXTS.about, ...(parsed.about || {}) },
          contacts: { ...DEFAULT_SITE_TEXTS.contacts, ...(parsed.contacts || {}) },
          services: { ...DEFAULT_SITE_TEXTS.services, ...(parsed.services || {}) },
          catalogs: { ...DEFAULT_SITE_TEXTS.catalogs, ...(parsed.catalogs || {}) },
          footer: { ...DEFAULT_SITE_TEXTS.footer, ...(parsed.footer || {}) },
        };
      }
    } catch {}
    return DEFAULT_SITE_TEXTS;
  });

  const [textConstants, setTextConstants] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('ds_text_constants_dict');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {}
    return buildDictionaryFromSiteTexts(DEFAULT_SITE_TEXTS);
  });

  const [textConstantsRecords, setTextConstantsRecords] = useState<TextConstantItem[]>([]);
  const [textConstantsLoading, setTextConstantsLoading] = useState<boolean>(true);
  const [textConstantsSource, setTextConstantsSource] = useState<string>('local_cache');

  // Global sync mechanism from PostgreSQL table 'text_constants' on AppProvider initialization
  const fetchGlobalTextConstants = useCallback(async () => {
    setTextConstantsLoading(true);
    try {
      // Запрос к реляционной таблице 'text_constants' через REST API
      const res = await fetch('/api/text-constants?fallback=true', {
        headers: { 'Accept': 'application/json', 'x-allow-fallback': 'true' }
      });
      if (res.ok) {
        const resJson = await res.json();
        if (resJson && resJson.success) {
          const dict: Record<string, string> = resJson.dictionary || {};
          const source = resJson.source || 'database_table';
          const records: TextConstantItem[] = resJson.records || resJson.constants || [];

          setTextConstants(dict);
          setTextConstantsRecords(records);
          setTextConstantsSource(source);

          try {
            localStorage.setItem('ds_text_constants_dict', JSON.stringify(dict));
          } catch {}

          if (resJson.data) {
            setSiteTexts((prev) => {
              const merged: SiteTextsData = {
                ...DEFAULT_SITE_TEXTS,
                ...prev,
                ...resJson.data,
                home: { ...DEFAULT_SITE_TEXTS.home, ...(prev.home || {}), ...(resJson.data.home || {}) },
                about: { ...DEFAULT_SITE_TEXTS.about, ...(prev.about || {}), ...(resJson.data.about || {}) },
                contacts: { ...DEFAULT_SITE_TEXTS.contacts, ...(prev.contacts || {}), ...(resJson.data.contacts || {}) },
                services: { ...DEFAULT_SITE_TEXTS.services, ...(prev.services || {}), ...(resJson.data.services || {}) },
                catalogs: { ...DEFAULT_SITE_TEXTS.catalogs, ...(prev.catalogs || {}), ...(resJson.data.catalogs || {}) },
                footer: { ...DEFAULT_SITE_TEXTS.footer, ...(prev.footer || {}), ...(resJson.data.footer || {}) },
              };
              try {
                localStorage.setItem('ds_site_texts', JSON.stringify(merged));
              } catch {}
              return merged;
            });

            // Автоматически синхронизируем companyInfo с таблицей contacts
            if (resJson.data.contacts) {
              setCompanyInfo((prev) => ({
                ...prev,
                phone: resJson.data.contacts.phoneMain || prev.phone,
                phoneClean: (resJson.data.contacts.phoneMain || prev.phone).replace(/\D/g, ''),
                email: resJson.data.contacts.emailMain || prev.email,
                address: resJson.data.contacts.addressSamara || prev.address,
                workHours: resJson.data.contacts.workHours || prev.workHours,
                inn: resJson.data.contacts.inn || prev.inn,
                ogrn: resJson.data.contacts.ogrn || prev.ogrn,
                kpp: resJson.data.contacts.kpp || prev.kpp,
              }));
            }
          }
          return;
        }
      }
    } catch (err) {
      console.warn('[AppProvider] Ошибка подгрузки text_constants из БД, используем локальный кэш:', err);
    } finally {
      setTextConstantsLoading(false);
    }

    // Резервная подгрузка из /api/site-texts при сбоях
    try {
      const res = await fetch('/api/site-texts');
      if (res.ok) {
        const resJson = await res.json();
        if (resJson && resJson.success && resJson.data) {
          setSiteTexts((prev) => {
            const merged = { ...DEFAULT_SITE_TEXTS, ...prev, ...resJson.data };
            try { localStorage.setItem('ds_site_texts', JSON.stringify(merged)); } catch {}
            return merged;
          });
          const dict = buildDictionaryFromSiteTexts(resJson.data);
          setTextConstants(dict);
          try { localStorage.setItem('ds_text_constants_dict', JSON.stringify(dict)); } catch {}
        }
      }
    } catch (e) {
      console.warn('[AppProvider] Fallback site-texts API error:', e);
    }
  }, []);

  // Инициализирующая подгрузка при монтировании AppProvider
  useEffect(() => {
    fetchGlobalTextConstants();
  }, [fetchGlobalTextConstants]);

  // Реактивный хелпер getText для мгновенного доступа к текущим значениям из БД в любых компонентах
  const getText = useCallback((key: string, fallback?: string): string => {
    // 1. Поиск в плоском словаре textConstants из таблицы text_constants
    if (textConstants && typeof textConstants[key] === 'string' && textConstants[key].trim() !== '') {
      return textConstants[key];
    }
    // 2. Поиск во вложенном объекте siteTexts: e.g. "home.heroTitle"
    const dotIndex = key.indexOf('.');
    if (dotIndex > 0) {
      const cat = key.slice(0, dotIndex) as keyof SiteTextsData;
      const field = key.slice(dotIndex + 1);
      if (siteTexts && (siteTexts as any)[cat] && typeof (siteTexts as any)[cat][field] === 'string') {
        const val = (siteTexts as any)[cat][field];
        if (val.trim() !== '') return val;
      }
    }
    // 3. Fallback, переданный вызывающим компонентом
    if (fallback !== undefined) return fallback;
    // 4. Исходные значения из DEFAULT_SITE_TEXTS
    if (dotIndex > 0) {
      const cat = key.slice(0, dotIndex) as keyof SiteTextsData;
      const field = key.slice(dotIndex + 1);
      if ((DEFAULT_SITE_TEXTS as any)[cat] && typeof (DEFAULT_SITE_TEXTS as any)[cat][field] === 'string') {
        return (DEFAULT_SITE_TEXTS as any)[cat][field];
      }
    }
    return '';
  }, [textConstants, siteTexts]);

  // Точечное обновление константы в таблице text_constants
  const updateTextConstant = async (key: string, value: string, description?: string): Promise<boolean> => {
    try {
      // Оптимистичное локальное обновление
      setTextConstants((prev) => {
        const next = { ...prev, [key]: value };
        try { localStorage.setItem('ds_text_constants_dict', JSON.stringify(next)); } catch {}
        return next;
      });

      const dotIndex = key.indexOf('.');
      if (dotIndex > 0) {
        const cat = key.slice(0, dotIndex) as keyof SiteTextsData;
        const field = key.slice(dotIndex + 1);
        setSiteTexts((prev) => {
          const next = {
            ...prev,
            [cat]: {
              ...(prev[cat] || {}),
              [field]: value
            }
          };
          try { localStorage.setItem('ds_site_texts', JSON.stringify(next)); } catch {}
          return next;
        });
      }

      const res = await apiService.updateTextConstant(key, value, description);
      if (res.success) {
        if (res.record) {
          setTextConstantsRecords((prev) => {
            const idx = prev.findIndex((r) => r.key === key);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = res.record!;
              return updated;
            }
            return [...prev, res.record!];
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error in updateTextConstant:', err);
      return false;
    }
  };

  // 3D WebGL Inspection Models State
  const [models3D, setModels3D] = useState<Model3DItem[]>(() => {
    try {
      const saved = localStorage.getItem('ds_3d_models');
      if (saved) {
        const parsed: Model3DItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_3D_MODELS;
  });

  // Sync 3D models with server on mount
  useEffect(() => {
    apiService.get3DModels().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setModels3D(data);
        try {
          localStorage.setItem('ds_3d_models', JSON.stringify(data));
        } catch {}
      }
    });
  }, []);

  // Save to localStorage whenever models3D changes
  useEffect(() => {
    try {
      localStorage.setItem('ds_3d_models', JSON.stringify(models3D));
    } catch {}
  }, [models3D]);

  // Compare & favorites
  const [compareList, setCompareList] = useState<Product[]>(() => {
    try {
      // 1. Check URL parameters first (?compare=id1,id2,id3)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const compareParam = urlParams.get('compare');
        if (compareParam) {
          const ids = compareParam.split(',').map((id) => id.trim());
          const found = PRODUCTS_DATA.filter((p) => ids.includes(p.id)).slice(0, 3);
          if (found.length > 0) {
            return found;
          }
        }
      }

      // 2. Check localStorage
      const saved = localStorage.getItem('ds_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatically open comparison modal if URL has ?compare=...
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('compare') && compareList.length > 0) {
          setIsCompareDrawerOpen(true);
        }
      }
    } catch {}
  }, []);

  // Contracts & Projects state with unified localStorage persistence

  const [certificates, setCertificates] = useState<TrainingCertificate[]>([]);
  useEffect(() => {
    if (!currentUser) return;
    apiService.getCrmCertificates(currentUser.role, currentUser.company).then(res => {
      if (res.success && res.data) {
        setCertificates(res.data);
      }
    });
  }, [currentUser]);

  const [metrologyReports, setMetrologyReports] = useState<MetrologyReport[]>([]);
  useEffect(() => {
    if (!currentUser) return;
    apiService.getCrmMetrologyReports(currentUser.role, currentUser.company).then(res => {
      if (res.success && res.data) {
        setMetrologyReports(res.data);
      }
    });
  }, [currentUser]);

  const [fleetDevices, setFleetDevices] = useState<CompanyFleetDevice[]>(INITIAL_COMPANY_FLEET);
  useEffect(() => {
    apiService.getCrmFleetDevices().then(res => {
      if (res.success && res.data) {
        setFleetDevices(res.data);
      }
    });
  }, []);

  const addFleetDevice = async (device: CompanyFleetDevice) => {
    const res = await apiService.saveCrmFleetDevice(device);
    if (res.success) {
      setFleetDevices(prev => [device, ...prev]);
      return true;
    }
    return false;
  };

  const updateFleetDevice = async (id: string, updates: Partial<CompanyFleetDevice>) => {
    const res = await apiService.updateCrmFleetDevice(id, updates);
    if (res.success) {
      setFleetDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      return true;
    }
    return false;
  };

  const deleteFleetDevice = async (id: string) => {
    const res = await apiService.deleteCrmFleetDevice(id);
    if (res.success) {
      setFleetDevices(prev => prev.filter(d => d.id !== id));
      return true;
    }
    return false;
  };

  const [contracts, setContracts] = useState<ProjectContract[]>(() => {
    try {
      const savedUser = localStorage.getItem('ds_current_user_v3');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u && u.role === 'client') {
          return [];
        }
      }
      const saved = localStorage.getItem('ds_crm_contracts');
      return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
    } catch {
      return INITIAL_CONTRACTS;
    }
  });

  useEffect(() => {
    if (!currentUser) {
      setContracts([]);
      return;
    }
    apiService.getCrmContracts(currentUser.role, currentUser.company).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setContracts(res.data);
      }
    });
  }, [currentUser?.role, currentUser?.company, currentUser?.id]);

  useEffect(() => {
    try {
      // Only cache master contracts list for admins/managers to avoid leaking to other tenants
      if (currentUser && currentUser.role !== 'client' && contracts.length > 0) {
        localStorage.setItem('ds_crm_contracts', JSON.stringify(contracts));
      }
    } catch (e) {
      console.error('Failed to save contracts to localStorage:', e);
    }
  }, [contracts, currentUser]);

  // Commercial Proposals state with unified localStorage persistence
  const [commercialProposals, setCommercialProposals] = useState<CommercialProposal[]>(() => {
    try {
      const saved = localStorage.getItem('ds_crm_proposals');
      return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
    } catch {
      return INITIAL_PROPOSALS;
    }
  });
  useEffect(() => {
    apiService.getCrmProposals().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setCommercialProposals(res.data);
      }
    });
  }, []);

  useEffect(() => {
    try {
      if (commercialProposals.length > 0) {
        localStorage.setItem('ds_crm_proposals', JSON.stringify(commercialProposals));
      }
    } catch (e) {
      console.error('Failed to save proposals to localStorage:', e);
    }
  }, [commercialProposals]);

  // Document Detail Level for TKP & TZ Generator ('express' | 'standard' | 'complex_project')
  const [documentDetailLevel, setDocumentDetailLevelState] = useState<'express' | 'standard' | 'complex_project' | 'engineering_opk'>(() => {
    try {
      const saved = localStorage.getItem('ds_crm_doc_detail_level') as any;
      if (saved === 'express' || saved === 'standard' || saved === 'complex_project' || saved === 'engineering_opk') {
        return saved === 'engineering_opk' ? 'complex_project' : saved;
      }
    } catch {}
    return 'standard';
  });

  const setDocumentDetailLevel = (level: 'express' | 'standard' | 'complex_project' | 'engineering_opk') => {
    const normalized = level === 'engineering_opk' ? 'complex_project' : level;
    setDocumentDetailLevelState(normalized);
    try {
      localStorage.setItem('ds_crm_doc_detail_level', normalized);
    } catch {}
  };

  // Deals & Funnels
  const [funnels, setFunnels] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ds_crm_funnels');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    apiService.getCrmFunnels().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setFunnels(res.data);
        try {
          localStorage.setItem('ds_crm_funnels', JSON.stringify(res.data));
        } catch (e) {}
      }
    });
  }, []);

  const updateFunnelStages = async (funnelId: string, stages: any[]) => {
    const targetFunnel = funnels.find(f => f.id === funnelId) || { id: funnelId, name: funnelId };
    const updatedFunnel = { ...targetFunnel, stages };

    setFunnels(prev => {
      const exists = prev.some(f => f.id === funnelId);
      const nextList = exists
        ? prev.map(f => f.id === funnelId ? updatedFunnel : f)
        : [...prev, updatedFunnel];
      try {
        localStorage.setItem('ds_crm_funnels', JSON.stringify(nextList));
      } catch (e) {}
      return nextList;
    });

    await apiService.saveCrmFunnel(updatedFunnel);
  };

  const resetFunnelsToDefault = async () => {
    const res = await apiService.resetCrmFunnels();
    if (res.success && res.data) {
      setFunnels(res.data);
      try {
        localStorage.setItem('ds_crm_funnels', JSON.stringify(res.data));
      } catch (e) {}
    }
  };

  // CRM Global VAT & Tax Settings
  const [crmSettings, setCrmSettings] = useState<CrmTaxSettings>(() => {
    try {
      const saved = localStorage.getItem('ds_crm_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CRM_TAX_SETTINGS,
          ...parsed,
          countryOverrides: Array.isArray(parsed?.countryOverrides) && parsed.countryOverrides.length > 0 
            ? parsed.countryOverrides 
            : DEFAULT_CRM_TAX_SETTINGS.countryOverrides,
          categoryOverrides: Array.isArray(parsed?.categoryOverrides) && parsed.categoryOverrides.length > 0 
            ? parsed.categoryOverrides 
            : DEFAULT_CRM_TAX_SETTINGS.categoryOverrides
        };
      }
    } catch (e) {}
    return { ...DEFAULT_CRM_TAX_SETTINGS };
  });

  useEffect(() => {
    apiService.getCrmSettings().then(res => {
      if (res.success && res.data) {
        setCrmSettings(prev => ({
          ...prev,
          ...res.data,
          countryOverrides: Array.isArray(res.data?.countryOverrides) && res.data.countryOverrides.length > 0
            ? res.data.countryOverrides
            : prev.countryOverrides || DEFAULT_CRM_TAX_SETTINGS.countryOverrides,
          categoryOverrides: Array.isArray(res.data?.categoryOverrides) && res.data.categoryOverrides.length > 0
            ? res.data.categoryOverrides
            : prev.categoryOverrides || DEFAULT_CRM_TAX_SETTINGS.categoryOverrides
        }));
      }
    });
  }, []);

  const updateCrmSettings = async (updates: Partial<CrmTaxSettings>) => {
    const next: CrmTaxSettings = { 
      ...crmSettings, 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    setCrmSettings(next);
    try {
      localStorage.setItem('ds_crm_settings', JSON.stringify(next));
    } catch (e) {}
    await apiService.saveCrmSettings(next);
  };

  const [deals, setDeals] = useState<ExtendedDeal[]>(() => {
    try {
      const saved = localStorage.getItem('ds_crm_deals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          return parsed.filter((d: ExtendedDeal) => {
            if (!d?.id || seen.has(d.id)) return false;
            seen.add(d.id);
            return true;
          });
        }
      }
      return INITIAL_CRM_DEALS;
    } catch {
      return INITIAL_CRM_DEALS;
    }
  });
  useEffect(() => {
    apiService.getCrmDeals().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        setDeals(prev => {
          const seen = new Set<string>();
          const combined = [...res.data, ...prev];
          return combined.filter((d: ExtendedDeal) => {
            if (!d?.id || seen.has(d.id)) return false;
            seen.add(d.id);
            return true;
          });
        });
      }
    });
  }, []);

  useEffect(() => {
    try {
      if (deals.length > 0) {
        const seen = new Set<string>();
        const unique = deals.filter(d => {
          if (!d?.id || seen.has(d.id)) return false;
          seen.add(d.id);
          return true;
        });
        localStorage.setItem('ds_crm_deals', JSON.stringify(unique));
      }
    } catch (e) {}
  }, [deals]);

  const addDeal = (deal: ExtendedDeal) => { 
    apiService.saveCrmDeal(deal); 
    setDeals(prev => {
      if (prev.some(d => d.id === deal.id)) {
        return prev.map(d => d.id === deal.id ? { ...d, ...deal } : d);
      }
      return [deal, ...prev];
    }); 
  };
  const updateDeal = (id: string, updates: Partial<ExtendedDeal>) => { apiService.updateCrmDeal(id, updates); setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d)); };
  const deleteDeal = (id: string) => { apiService.deleteCrmDeal(id); setDeals(prev => prev.filter(d => d.id !== id)); };

  // Support Tickets
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);
  useEffect(() => {
    if (!currentUser) return;
    apiService.getCrmTickets(currentUser.role, currentUser.company).then(res => {
      if (res.success && res.data) {
        const seen = new Set<string>();
        const unique = (res.data as SupportTicketItem[]).filter(t => {
          if (!t?.id || seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
        setSupportTickets(unique);
      }
    });
  }, [currentUser]);


  useEffect(() => {
    try {
      // no-op
    } catch (e) {}
  }, [supportTickets]);

  const addSupportTicket = (ticket: SupportTicketItem) => { 
    apiService.saveCrmTicket(ticket); 
    setSupportTickets(prev => {
      if (prev.some(t => t.id === ticket.id)) {
        return prev.map(t => t.id === ticket.id ? { ...t, ...ticket } : t);
      }
      return [ticket, ...prev];
    }); 
  };
  const updateSupportTicket = (id: string, updates: Partial<SupportTicketItem>) => { apiService.updateCrmTicket(id, updates); setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)); };
  const deleteSupportTicket = (id: string) => { apiService.deleteCrmTicket(id); setSupportTickets(prev => prev.filter(t => t.id !== id)); };

  // Licenses
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  useEffect(() => {
    if (!currentUser) return;
    apiService.getCrmLicenses(currentUser.role, currentUser.company).then(res => {
      if (res.success && res.data) {
        const seen = new Set<string>();
        const unique = (res.data as LicenseItem[]).filter(l => {
          if (!l?.id || seen.has(l.id)) return false;
          seen.add(l.id);
          return true;
        });
        setLicenses(unique);
      }
    });
  }, [currentUser]);


  useEffect(() => {
    try {
      // no-op
    } catch (e) {}
  }, [licenses]);

  const addLicense = (license: LicenseItem) => { 
    apiService.saveCrmLicense(license); 
    setLicenses(prev => {
      if (prev.some(l => l.id === license.id)) {
        return prev.map(l => l.id === license.id ? { ...l, ...license } : l);
      }
      return [license, ...prev];
    }); 
  };
  const updateLicense = (id: string, updates: Partial<LicenseItem>) => { apiService.updateCrmLicense(id, updates); setLicenses(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l)); };
  const deleteLicense = (id: string) => { apiService.deleteCrmLicense(id); setLicenses(prev => prev.filter(l => l.id !== id)); };

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ds_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Admin Accounts
  const login = (email: string, password?: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const user = authUsers.find((u) => u.email.toLowerCase() === trimmed);
    if (!user) {
      showToast('Пользователь с таким email не найден');
      return false;
    }

    if (password && user.password && user.password !== password) {
      showToast('Неверный пароль для входа');
      return false;
    }

    const { password: _, ...profile } = user;
    const hydratedProfile: UserProfile = {
      ...profile,
      permissions: profile.permissions || DEFAULT_ROLE_PERMISSIONS[profile.role] || DEFAULT_ROLE_PERMISSIONS.client,
    };
    setCurrentUser(hydratedProfile);
    if (profile.role === 'superadmin') {
      showToast(`Добро пожаловать, ${profile.fullName}! Активирован полный доступ Супер-администратора.`);
    } else if (profile.role === 'admin') {
      showToast(`Добро пожаловать, ${profile.fullName}! Права администратора активированы.`);
    } else if (profile.role === 'moderator') {
      showToast(`Добро пожаловать, ${profile.fullName}! Права модератора активированы.`);
    } else if (profile.role === 'manager') {
      showToast(`Добро пожаловать в CRM-систему, ${profile.fullName}!`);
    } else {
      showToast(`Добро пожаловать в личный кабинет, ${profile.fullName}!`);
    }
    return true;
  };

  const logout = () => {
    const wasAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
    setCurrentUser(null);
    localStorage.removeItem('ds_current_user');
    localStorage.removeItem('ds_current_user_v2');
    localStorage.removeItem('ds_current_user_v3');
    showToast('Вы успешно вышли из профиля');
    if (wasAdmin && currentPage === 'cms') {
      navigateTo('home');
    }
  };

  const register = async (data: { fullName: string; email: string; phone: string; company: string; position: string; password?: string }): Promise<boolean> => {
    const trimmed = data.email.trim().toLowerCase();
    if (authUsers.some((u) => u.email.toLowerCase() === trimmed)) {
      showToast('Пользователь с таким email уже зарегистрирован');
      return false;
    }

    const newAcc: AuthAccount = {
      id: `cli-${Date.now().toString().slice(-5)}`,
      email: data.email.trim(),
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      company: data.company.trim() || 'Предприятие',
      position: data.position.trim() || 'Специалист',
      role: 'client',
      password: data.password || '123456',
      contractNumber: `ДОГ-2026-СМР/${Math.floor(10 + Math.random() * 90)}`,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: DEFAULT_ROLE_PERMISSIONS.client,
    };

    try {
      const res = await fetchWithCsrf('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAcc),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || 'Ошибка при сохранении пользователя в базе данных');
        return false;
      }

      const createdUser: AuthAccount = json.data ? {
        ...newAcc,
        id: json.data.id || newAcc.id,
        permissions: json.data.permissions || newAcc.permissions,
      } : newAcc;

      const updatedUsers = [...authUsers, createdUser];
      setAuthUsers(updatedUsers);
      const { password: _, ...profile } = createdUser;
      setCurrentUser(profile);
      try {
        localStorage.setItem('ds_current_user_v3', JSON.stringify(profile));
      } catch {}

      // Reset contracts to empty array for newly registered client
      setContracts([]);

      showToast(`Регистрация завершена! Добро пожаловать, ${profile.fullName}`);
      return true;
    } catch (err) {
      console.error('Error saving registered user in DB:', err);
      showToast('Ошибка сетевого подключения при регистрации');
      return false;
    }
  };

  const createUser = (data: Omit<AuthAccount, 'id'>): boolean => {
    const trimmed = data.email.trim().toLowerCase();
    if (authUsers.some((u) => u.email.toLowerCase() === trimmed)) {
      showToast('Пользователь с таким email уже существует');
      return false;
    }

    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[data.role] || DEFAULT_ROLE_PERMISSIONS.client;
    const prefix = data.role === 'admin' ? 'adm' : data.role === 'manager' ? 'mng' : 'cli';
    const newAcc: AuthAccount = {
      ...data,
      id: `${prefix}-${Date.now().toString().slice(-5)}`,
      email: data.email.trim(),
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      company: data.company.trim() || (data.role === 'client' ? 'Предприятие' : 'ООО «ДС‑Инжиниринг»'),
      position: data.position.trim() || (data.role === 'superadmin' ? 'Генеральный директор' : data.role === 'admin' ? 'Администратор' : data.role === 'moderator' ? 'Модератор' : data.role === 'manager' ? 'Менеджер проектов' : 'Специалист'),
      role: data.role,
      password: data.password || '123456',
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
      permissions: {
        ...defaultPerms,
        ...(data.permissions || {}),
      },
    };

    setAuthUsers((prev) => [...prev, newAcc]);

    // Persist to PostgreSQL database
    fetchWithCsrf('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAcc),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setAuthUsers((prev) =>
            prev.map((u) => (u.email.toLowerCase() === trimmed ? { ...u, id: resData.data.id } : u))
          );
        }
      })
      .catch((err) => {
        console.error('Error creating user in DB:', err);
      });

    showToast(`Пользователь «${newAcc.fullName}» успешно сохранен в базе данных`);
    return true;
  };

  const updateUser = (id: string, updates: Partial<AuthAccount>): boolean => {
    let updatedAcc: AuthAccount | null = null;
    const nextUsers = authUsers.map((u) => {
      if (u.id === id) {
        const newRole = updates.role || u.role;
        const currentPerms = getUserPermissions(u);
        const newPerms = updates.role && updates.role !== u.role
          ? { ...DEFAULT_ROLE_PERMISSIONS[newRole], ...(updates.permissions || {}) }
          : { ...currentPerms, ...(updates.permissions || {}) };

        updatedAcc = {
          ...u,
          ...updates,
          permissions: newPerms,
        };
        return updatedAcc;
      }
      return u;
    });

    setAuthUsers(nextUsers);

    if (currentUser && currentUser.id === id && updatedAcc) {
      const { password: _, ...freshProfile } = updatedAcc;
      setCurrentUser(freshProfile);
    }

    // Persist to PostgreSQL database
    fetchWithCsrf(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => {
      console.error('Error saving user update to DB:', err);
    });

    showToast('Данные пользователя обновлены в базе данных');
    return true;
  };

  const updateUserPermissions = (id: string, permissions: Partial<UserPermissions>): boolean => {
    let updatedAcc: AuthAccount | null = null;
    const nextUsers = authUsers.map((u) => {
      if (u.id === id || (currentUser && currentUser.id === id && Boolean(u.email && currentUser.email) && u.email.toLowerCase() === currentUser.email.toLowerCase())) {
        const currentPerms = getUserPermissions(u);
        const newPerms: UserPermissions = {
          ...currentPerms,
          ...permissions,
        };
        updatedAcc = {
          ...u,
          permissions: newPerms,
        };
        return updatedAcc;
      }
      return u;
    });

    setAuthUsers(nextUsers);

    if (currentUser && (currentUser.id === id || (updatedAcc && Boolean(currentUser.email && (updatedAcc as AuthAccount).email) && currentUser.email.toLowerCase() === (updatedAcc as AuthAccount).email.toLowerCase()))) {
      const currentPerms = getUserPermissions(currentUser);
      const mergedPerms: UserPermissions = {
        ...currentPerms,
        ...permissions,
      };
      setCurrentUser((prev) => prev ? {
        ...prev,
        permissions: mergedPerms,
      } : null);
    }

    // Persist specifically user permissions in PostgreSQL database
    fetchWithCsrf(`/api/users/${id}/permissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions }),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const freshPermissions = resData.data.permissions;
          setAuthUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, permissions: freshPermissions } : u))
          );
          if (currentUser && (currentUser.id === id || (Boolean(currentUser.email && resData.data.email) && currentUser.email.toLowerCase() === resData.data.email.toLowerCase()))) {
            setCurrentUser((prev) => prev ? {
              ...prev,
              permissions: freshPermissions,
            } : null);
          }
        }
      })
      .catch((err) => {
        console.error('Error updating user permissions in DB:', err);
      });

    showToast('Права доступа пользователя сохранены в базе данных');
    return true;
  };

  const deleteUser = (id: string): boolean => {
    const target = authUsers.find((u) => u.id === id);
    if (!target) {
      showToast('Пользователь не найден');
      return false;
    }
    if (target.id === 'adm-01' || target.email === 's.nekrasov@ds-enginering.ru') {
      showToast('Нельзя удалить главного администратора системы');
      return false;
    }
    if (currentUser?.id === id) {
      showToast('Нельзя удалить текущего авторизованного пользователя');
      return false;
    }

    setAuthUsers((prev) => prev.filter((u) => u.id !== id));

    // Delete from PostgreSQL database
    fetchWithCsrf(`/api/users/${id}`, {
      method: 'DELETE',
    }).catch((err) => {
      console.error('Error deleting user from DB:', err);
    });

    showToast(`Пользователь «${target.fullName}» удален из базы данных`);
    return true;
  };

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';


  const [contactModal, setContactModal] = useState<ContactModalConfig>({
    isOpen: false,
    title: 'Запросить консультацию',
    subtitle: 'Инженеры компании свяжутся с вами для квалифицированной консультации и расчета',
    formType: 'consultation',
  });

  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackInitialData, setCallbackInitialData] = useState<{ topic?: string; phone?: string; name?: string } | undefined>(undefined);

  const openCallbackModal = (initialData?: { topic?: string; phone?: string; name?: string }) => {
    setCallbackInitialData(initialData);
    setIsCallbackModalOpen(true);
  };

  const closeCallbackModal = () => {
    setIsCallbackModalOpen(false);
    setCallbackInitialData(undefined);
  };

  const [isConfiguratorModalOpen, setIsConfiguratorModalOpen] = useState(false);
  const openConfiguratorModal = () => setIsConfiguratorModalOpen(true);
  const closeConfiguratorModal = () => setIsConfiguratorModalOpen(false);

  const [isRoiCalculatorModalOpen, setIsRoiCalculatorModalOpen] = useState(false);
  const openRoiCalculatorModal = () => setIsRoiCalculatorModalOpen(true);
  const closeRoiCalculatorModal = () => setIsRoiCalculatorModalOpen(false);

  const isCmsHydratedRef = useRef(false);

  // Fetch and hydrate central server CMS state on mount
  useEffect(() => {
    let isMounted = true;
    apiService.fetchCmsState().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        const { customPages: sPages, products: sProds, services: sServs, articles: sArts, knowledgeBase: sKb, companyInfo: sComp } = res.data;
        if (Array.isArray(sPages) && sPages.length > 0) {
          const existingIds = new Set(sPages.map((p: any) => p.id));
          const missingSystem = DEFAULT_SYSTEM_PAGES.filter(p => !existingIds.has(p.id));
          const upgraded = sPages.map((p: any) => {
            const sys = DEFAULT_SYSTEM_PAGES.find(s => s.id === p.id);
            if (sys && (!p.blocks || (p.blocks.length <= 2 && p.blocks[0]?.id?.startsWith('hero-')))) {
              return sys;
            }
            return p;
          });
          setCustomPages([...upgraded, ...missingSystem]);
        } else {
          setCustomPages(DEFAULT_SYSTEM_PAGES);
        }
        if (Array.isArray(sProds) && sProds.length > 0) setProducts(sProds);
        if (Array.isArray(sServs) && sServs.length > 0) setServices(sServs);
        if (Array.isArray(sArts) && sArts.length > 0) {
          if (sArts.length < 12) {
            setArticles(NEWS_ARTICLES);
          } else {
            setArticles(sArts);
          }
        }
        if (Array.isArray(sKb) && sKb.length > 0) setKnowledgeBase(sKb);
        if (sComp && typeof sComp === 'object') setCompanyInfo((prev) => ({ ...prev, ...sComp }));
      }
      // Set hydration flag so subsequent user changes trigger server autosave
      setTimeout(() => {
        if (isMounted) isCmsHydratedRef.current = true;
      }, 500);
    }).catch(() => {
      setTimeout(() => {
        if (isMounted) isCmsHydratedRef.current = true;
      }, 500);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist CMS changes to localStorage & central server
  useEffect(() => {
    try {
      localStorage.setItem('ds_cms_pages', JSON.stringify(customPages));
      if (isCmsHydratedRef.current) {
        apiService.saveCmsState({ customPages });
      }
    } catch {}
  }, [customPages]);

  useEffect(() => {
    try {
      localStorage.setItem('ds_cms_products', JSON.stringify(products));
      if (isCmsHydratedRef.current) {
        apiService.saveCmsState({ products });
      }
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('ds_cms_services', JSON.stringify(services));
      if (isCmsHydratedRef.current) {
        apiService.saveCmsState({ services });
      }
    } catch {}
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('ds_cms_articles', JSON.stringify(articles));
      if (isCmsHydratedRef.current) {
        apiService.saveCmsState({ articles });
      }
    } catch {}
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem('ds_cms_knowledge', JSON.stringify(knowledgeBase));
      if (isCmsHydratedRef.current) {
        apiService.saveCmsState({ knowledgeBase });
      }
    } catch {}
  }, [knowledgeBase]);

  useEffect(() => {
    try {
      localStorage.setItem('ds_cms_company', JSON.stringify(companyInfo));
      if (isCmsHydratedRef.current) {
        apiService.saveCmsState({ companyInfo });
      }
    } catch {}
  }, [companyInfo]);

  useEffect(() => {
    try {
      localStorage.setItem('ds_compare', JSON.stringify(compareList));
    } catch {}
  }, [compareList]);

  useEffect(() => {
    try {
      localStorage.setItem('ds_favs', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const showToast = (msg: string, _type?: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const navigateTo = useCallback((page: PageId, detailId?: string, skipHistory = false) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (!skipHistory) {
      updateBrowserUrl(page, detailId);
    }

    if (detailId) {

      if (page === 'software') {
        const lower = detailId.toLowerCase();
        if (['all', 'topsolid', 'polyworks', 'geomagic', 'shining3d', 'shining3d-sw'].includes(lower)) {

          setActiveCategory(lower);
          setSelectedProduct(null);
        } else {
          const found = products.find((p) => p.id.toLowerCase() === lower);
          if (found) {
            setSelectedProduct(found);
            setActiveCategory(found.category || null);
          } else {
            setActiveCategory(lower);
            setSelectedProduct(null);
          }
        }
      } else if (page === 'hardware') {
        const found = products.find((p) => p.id.toLowerCase() === detailId.toLowerCase() || p.category === detailId || p.id.includes(detailId));
        if (found) setSelectedProduct(found);
      } else if (page === 'services') {
        setSelectedServiceId(detailId);
      } else if (page === 'news') {
        const found = articles.find((a) => a.id.toLowerCase() === detailId.toLowerCase());
        if (found) setSelectedArticle(found);
      } else if (page === 'knowledge') {
        const found = knowledgeBase.find((k) => k.id.toLowerCase() === detailId.toLowerCase());
        if (found) {
          setSelectedKnowledgeItem(found);
          setSelectedKnowledgeCategory(found.category);
        } else {
          setSelectedKnowledgeCategory(detailId);
          setSelectedKnowledgeItem(null);
        }
      }
    } else {
      if (page === 'software') {
        setActiveCategory('all');
      }
      setSelectedProduct(null);
      setSelectedArticle(null);
      if (page !== 'services') {
        setSelectedServiceId(null);
      }
      if (page !== 'knowledge') {
        setSelectedKnowledgeItem(null);
        setSelectedKnowledgeCategory(null);
      }
    }
  }, [products, articles, knowledgeBase]);

  // Automatic logging of visited pages to User Navigation History
  useEffect(() => {
    let title = '';
    let badge = 'Раздел';
    const path = getRoutePath(currentPage, selectedProduct?.id || selectedArticle?.id || selectedServiceId || selectedKnowledgeItem?.id || undefined);

    if (selectedProduct) {
      title = selectedProduct.name;
      badge = selectedProduct.type === 'software' ? 'ПО' : 'Оборудование';
    } else if (selectedArticle) {
      title = selectedArticle.title;
      badge = 'Новость';
    } else if (selectedKnowledgeItem) {
      title = selectedKnowledgeItem.title;
      badge = 'База знаний';
    } else if (selectedServiceId) {
      const isCalc = selectedServiceId === 'calculator' || selectedServiceId === 'service-calculator';
      const srv = services.find((s) => s.id === selectedServiceId);
      title = isCalc ? 'Онлайн-калькулятор стоимости' : (srv?.title || 'Инжиниринговая услуга');
      badge = 'Услуга';
    } else if (activeCategory && activeCategory !== 'all' && (currentPage === 'software' || currentPage === 'hardware')) {
      title = currentPage === 'software' ? getSoftwareCategoryLabel(activeCategory) : getHardwareCategoryLabel(activeCategory);
      badge = 'Категория';
    } else if (selectedKnowledgeCategory && selectedKnowledgeCategory !== 'all') {
      title = getKnowledgeCategoryLabel(selectedKnowledgeCategory);
      badge = 'База знаний';
    } else {
      if (currentPage.startsWith('custom-')) {
        const cp = customPages.find((p) => p.id === currentPage);
        title = cp?.title || 'Информационный раздел';
        badge = 'Страница';
      } else {
        title = getPageTitle(currentPage, isAdmin);
        badge = currentPage === 'home' ? 'Портал' : currentPage === 'account' ? 'Кабинет' : currentPage === 'cms' ? 'CMS' : currentPage === 'crm' ? 'CRM' : 'Раздел';
      }
    }

    if (title) {
      addToNavigationHistory({
        title,
        page: currentPage,
        detailId: selectedProduct?.id || selectedArticle?.id || selectedKnowledgeItem?.id || selectedServiceId || undefined,
        category: activeCategory || selectedKnowledgeCategory || undefined,
        path,
        badge,
      });
    }
  }, [
    currentPage,
    selectedProduct,
    selectedArticle,
    selectedKnowledgeItem,
    selectedServiceId,
    activeCategory,
    selectedKnowledgeCategory,
    customPages,
    services,
    isAdmin,
    addToNavigationHistory,
  ]);

  // Browser History & Popstate synchronization (Back / Forward button support)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Canonicalize initial path: if / or empty, replace with /main in browser address bar
    if (window.location.pathname === '/' || window.location.pathname === '') {
      updateBrowserUrl('home', undefined, true);
    } else {
      const current = parseCurrentLocation();
      updateBrowserUrl(current.page, current.detailId, true);
    }

    const handlePopState = () => {
      const route = parseCurrentLocation();
      navigateTo(route.page, route.detailId, true);
      if (route.scrollTo) {
        setTimeout(() => {
          const el = document.getElementById(route.scrollTo!);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateTo]);

  // Scroll to anchor on initial load if present (e.g. /calculator -> service-calculator)
  useEffect(() => {
    if (initialRoute.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(initialRoute.scrollTo!);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    }
  }, [initialRoute]);

  // Custom Pages handlers
  const addCustomPage = (page: CustomPage) => {
    setCustomPages((prev) => [page, ...prev]);
    showToast(`Страница «${page.title}» успешно создана!`);
  };

  const updateCustomPage = (id: string, updated: Partial<CustomPage>) => {
    setCustomPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: 'Сегодня' } : p))
    );
    showToast('Изменения страницы сохранены');
  };

  const deleteCustomPage = (id: string) => {
    setCustomPages((prev) => prev.filter((p) => p.id !== id));
    showToast('Страница удалена');
    if (currentPage === (id as PageId)) {
      setCurrentPage('home');
    }
  };

  // Products handlers
  const addProduct = (prod: Product) => {
    setProducts((prev) => [prod, ...prev]);
    showToast(`Продукт «${prod.name}» добавлен в каталог!`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    showToast('Информация о товаре обновлена');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Продукт удален из каталога');
  };

  // Services handlers
  const addService = (serv: ServiceItem) => {
    setServices((prev) => [...prev, serv]);
    showToast(`Услуга «${serv.title}» добавлена`);
  };

  const updateService = (id: string, updated: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
    showToast('Услуга обновлена');
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Услуга удалена');
  };

  // Articles handlers
  const addArticle = (art: Article) => {
    setArticles((prev) => [art, ...prev]);
    showToast(`Новость «${art.title}» опубликована`);
  };

  const updateArticle = (id: string, updated: Partial<Article>) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    showToast('Новость обновлена');
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    showToast('Новость удалена');
  };

  // Knowledge handlers
  const addKnowledgeItem = (item: KnowledgeItem) => {
    setKnowledgeBase((prev) => [item, ...prev]);
    showToast(`Статья «${item.title}» добавлена в базу знаний`);
  };

  const updateKnowledgeItem = (id: string, updated: Partial<KnowledgeItem>) => {
    setKnowledgeBase((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...updated } : k))
    );
    showToast('Статья обновлена');
  };

  const deleteKnowledgeItem = (id: string) => {
    setKnowledgeBase((prev) => prev.filter((k) => k.id !== id));
    showToast('Статья удалена');
  };

  // 3D WebGL Inspection Models handlers
  const addModel3D = async (modelData: Partial<Model3DItem>): Promise<boolean> => {
    try {
      const res = await apiService.create3DModel(modelData);
      if (res.success && res.data) {
        setModels3D((prev) => [...prev, res.data!]);
        showToast(`3D-модель «${res.data.name}» успешно добавлена`);
        return true;
      }
    } catch {}
    // Local fallback
    const newModel: Model3DItem = {
      id: modelData.id || `model-${Date.now()}`,
      name: modelData.name || 'Новая 3D-модель',
      category: modelData.category || 'Инжиниринг',
      geometryType: modelData.geometryType || 'procedural_impeller',
      description: modelData.description || '',
      material: modelData.material || 'Конструкционная сталь',
      manufacturingProcess: modelData.manufacturingProcess || 'ЧПУ обработка',
      pointCount: modelData.pointCount || 150000,
      triangleCount: modelData.triangleCount || 300000,
      minTolerance: modelData.minTolerance ?? -0.05,
      maxTolerance: modelData.maxTolerance ?? 0.05,
      inspectionPoints: modelData.inspectionPoints || [],
      customMeshUrl: modelData.customMeshUrl,
      cadFileUrl: modelData.cadFileUrl,
      cadFileName: modelData.cadFileName,
      cadFileSize: modelData.cadFileSize,
      scanMeshUrl: modelData.scanMeshUrl,
      scanMeshFileName: modelData.scanMeshFileName,
      scanMeshFileSize: modelData.scanMeshFileSize,
      pointCloudUrl: modelData.pointCloudUrl,
      pointCloudFileName: modelData.pointCloudFileName,
      pointCloudFileSize: modelData.pointCloudFileSize,
      orderIndex: models3D.length,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setModels3D((prev) => [...prev, newModel]);
    showToast(`3D-модель «${newModel.name}» добавлена`);
    return true;
  };

  const updateModel3D = async (id: string, updates: Partial<Model3DItem>): Promise<boolean> => {
    try {
      await apiService.update3DModel(id, updates);
    } catch {}
    setModels3D((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
    showToast('Параметры 3D-модели обновлены');
    return true;
  };

  const deleteModel3D = async (id: string): Promise<boolean> => {
    try {
      await apiService.delete3DModel(id);
    } catch {}
    setModels3D((prev) => prev.filter((m) => m.id !== id));
    showToast('3D-модель удалена из просмотрщика');
    return true;
  };

  const resetModels3D = async (): Promise<boolean> => {
    try {
      const res = await apiService.reset3DModels();
      if (res.success && res.data) {
        setModels3D(res.data);
      } else {
        setModels3D(DEFAULT_3D_MODELS);
      }
    } catch {
      setModels3D(DEFAULT_3D_MODELS);
    }
    showToast('3D-модели сброшены к заводским инженерным пресетам');
    return true;
  };

  // Contracts handlers
  const addContract = (contract: ProjectContract) => {
    apiService.saveCrmContract(contract);
    setContracts((prev) => [contract, ...prev]);
    showToast(`Договор ${contract.number} успешно добавлен`);
  };

  const updateContract = (id: string, updates: Partial<ProjectContract>) => {
    apiService.updateCrmContract(id, updates);
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Договор успешно обновлен');
  };

  const deleteContract = (id: string) => {
    apiService.deleteCrmContract(id);
    setContracts((prev) => prev.filter((c) => c.id !== id));
    showToast('Договор удален из базы');
  };

  // Commercial Proposals handlers
  const addCommercialProposal = (proposal: CommercialProposal) => {
    apiService.saveCrmProposal(proposal);
    setCommercialProposals((prev) => [proposal, ...prev]);
    showToast(`КП ${proposal.outgoingNumber} успешно зарегистрировано`);
  };

  const updateCommercialProposal = (id: string, updates: Partial<CommercialProposal>) => {
    apiService.updateCrmProposal(id, updates);
    setCommercialProposals((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('КП успешно обновлено');
  };

  const deleteCommercialProposal = (id: string) => {
    apiService.deleteCrmProposal(id);
    setCommercialProposals((prev) => prev.filter((p) => p.id !== id));
    showToast('КП удалено из реестра');
  };

  // Company info
  const updateCompanyInfo = (info: Partial<typeof COMPANY_INFO>) => {
    setCompanyInfo((prev) => ({ ...prev, ...info }));
    showToast('Контактные данные и реквизиты обновлены');
  };

  // Global Site Text Constants Handlers
  const updateSiteTexts = async (incoming: Partial<SiteTextsData>): Promise<boolean> => {
    try {
      const merged: SiteTextsData = {
        ...siteTexts,
        ...incoming,
        home: { ...siteTexts.home, ...(incoming.home || {}) },
        about: { ...siteTexts.about, ...(incoming.about || {}) },
        contacts: { ...siteTexts.contacts, ...(incoming.contacts || {}) },
        services: { ...siteTexts.services, ...(incoming.services || {}) },
        catalogs: { ...siteTexts.catalogs, ...(incoming.catalogs || {}) },
        footer: { ...siteTexts.footer, ...(incoming.footer || {}) },
      };
      setSiteTexts(merged);
      const dict = buildDictionaryFromSiteTexts(merged);
      setTextConstants(dict);
      try {
        localStorage.setItem('ds_site_texts', JSON.stringify(merged));
        localStorage.setItem('ds_text_constants_dict', JSON.stringify(dict));
      } catch {}

      const res = await fetchWithCsrf('/api/site-texts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });

      // Синхронизируем состояние с базой данных
      fetchGlobalTextConstants();

      return res.ok;
    } catch (err) {
      console.error('Error updating site-texts:', err);
      return false;
    }
  };

  const resetSiteTexts = async (): Promise<boolean> => {
    try {
      const defaultClone = JSON.parse(JSON.stringify(DEFAULT_SITE_TEXTS));
      setSiteTexts(defaultClone);
      const dict = buildDictionaryFromSiteTexts(defaultClone);
      setTextConstants(dict);
      try {
        localStorage.removeItem('ds_site_texts');
        localStorage.setItem('ds_text_constants_dict', JSON.stringify(dict));
      } catch {}

      const res = await fetchWithCsrf('/api/site-texts/reset', {
        method: 'POST',
      });
      fetchGlobalTextConstants();
      return res.ok;
    } catch (err) {
      console.error('Error resetting site-texts:', err);
      return false;
    }
  };

  const importSiteTexts = async (incoming: Partial<SiteTextsData>): Promise<boolean> => {
    try {
      const merged: SiteTextsData = {
        ...DEFAULT_SITE_TEXTS,
        ...incoming,
        home: { ...DEFAULT_SITE_TEXTS.home, ...(incoming.home || {}) },
        about: { ...DEFAULT_SITE_TEXTS.about, ...(incoming.about || {}) },
        contacts: { ...DEFAULT_SITE_TEXTS.contacts, ...(incoming.contacts || {}) },
        services: { ...DEFAULT_SITE_TEXTS.services, ...(incoming.services || {}) },
        catalogs: { ...DEFAULT_SITE_TEXTS.catalogs, ...(incoming.catalogs || {}) },
        footer: { ...DEFAULT_SITE_TEXTS.footer, ...(incoming.footer || {}) },
      };
      setSiteTexts(merged);
      const dict = buildDictionaryFromSiteTexts(merged);
      setTextConstants(dict);
      try {
        localStorage.setItem('ds_site_texts', JSON.stringify(merged));
        localStorage.setItem('ds_text_constants_dict', JSON.stringify(dict));
      } catch {}

      const res = await fetchWithCsrf('/api/site-texts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: merged }),
      });
      fetchGlobalTextConstants();
      return res.ok;
    } catch (err) {
      console.error('Error importing site-texts:', err);
      return false;
    }
  };

  // Full Export/Import/Reset
  const exportAllDataJSON = () => {
    const backup = {
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
      companyInfo,
      siteTexts,
      customPages,
      products,
      services,
      articles,
      knowledgeBase,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.customPages) setCustomPages(data.customPages);
      if (data.products) setProducts(data.products);
      if (data.services) setServices(data.services);
      if (data.articles) setArticles(data.articles);
      if (data.knowledgeBase) setKnowledgeBase(data.knowledgeBase);
      if (data.companyInfo) setCompanyInfo(data.companyInfo);
      if (data.siteTexts) {
        setSiteTexts(data.siteTexts);
        updateSiteTexts(data.siteTexts);
      }
      showToast('Все данные сайта успешно импортированы!');
      return true;
    } catch (e) {
      showToast('Ошибка при чтении JSON-файла. Проверьте формат.');
      return false;
    }
  };

  const resetToDefaultData = () => {
    setCustomPages(DEFAULT_CUSTOM_PAGES);
    setProducts(PRODUCTS_DATA);
    setServices(SERVICES_DATA);
    setArticles(NEWS_ARTICLES);
    setKnowledgeBase(KNOWLEDGE_BASE_ITEMS);
    setCompanyInfo(COMPANY_INFO);
    setSiteTexts(DEFAULT_SITE_TEXTS);
    resetSiteTexts();
    localStorage.removeItem('ds_cms_pages');
    localStorage.removeItem('ds_cms_products');
    localStorage.removeItem('ds_cms_services');
    localStorage.removeItem('ds_cms_articles');
    localStorage.removeItem('ds_cms_knowledge');
    localStorage.removeItem('ds_cms_company');
    localStorage.removeItem('ds_site_texts');
    showToast('Все данные сброшены к начальным значениям');
  };

  const resetCrmDatabase = async (): Promise<boolean> => {
    try {
      const res = await apiService.resetCrmDatabase();
      
      // Clear client-side cached CRM / Account data from localStorage
      localStorage.removeItem('ds_crm_deals');
      localStorage.removeItem('ds_crm_contracts');
      localStorage.removeItem('ds_crm_proposals');
      localStorage.removeItem('ds_crm_companies');
      localStorage.removeItem('ds_crm_contacts');
      localStorage.removeItem('ds_crm_tickets');
      localStorage.removeItem('ds_crm_licenses');
      localStorage.removeItem('ds_crm_fleet');
      localStorage.removeItem('ds_user_tasks');
      localStorage.removeItem('ds_account_contracts');
      localStorage.removeItem('ds_account_orders');
      localStorage.removeItem('ds_account_tickets');

      // Re-populate state from response data or initial fallbacks
      if (res?.data?.contracts) setContracts(res.data.contracts);
      else setContracts(INITIAL_CONTRACTS);

      if (res?.data?.deals) setDeals(res.data.deals);
      else setDeals(INITIAL_CRM_DEALS);

      if (res?.data?.proposals) setCommercialProposals(res.data.proposals);
      else setCommercialProposals(INITIAL_PROPOSALS);

      if (res?.data?.tickets) setSupportTickets(res.data.tickets);
      else setSupportTickets(INITIAL_SUPPORT_TICKETS);

      if (res?.data?.licenses) setLicenses(res.data.licenses);
      else setLicenses(INITIAL_LICENSES);

      if (res?.data?.fleet) setFleetDevices(res.data.fleet);
      else setFleetDevices(INITIAL_COMPANY_FLEET);

      window.dispatchEvent(new CustomEvent('crm-database-reset'));

      showToast('База данных CRM и Личного кабинета успешно сброшена к начальному состоянию');
      return true;
    } catch (e) {
      console.error('Failed to reset CRM database:', e);
      showToast('Ошибка при сбросе базы данных CRM');
      return false;
    }
  };

  const addToCompare = (product: Product) => {
    if (compareList.some((p) => p.id === product.id)) {
      setCompareList(compareList.filter((p) => p.id !== product.id));
      showToast(`«${product.name}» удален из сравнения`);
      return;
    }
    if (compareList.length >= 4) {
      showToast('В сравнение можно добавить максимум 4 товара одновременно');
      setIsCompareDrawerOpen(true);
      return;
    }
    setCompareList([...compareList, product]);
    showToast(`«${product.name}» добавлен в список сравнения (${compareList.length + 1} из 4)`);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(compareList.filter((p) => p.id !== productId));
    showToast('Товар удален из сравнения');
  };

  const clearCompare = () => {
    setCompareList([]);
    showToast('Список сравнения очищен');
  };

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter((id) => id !== productId));
      showToast('Удалено из избранного');
    } else {
      setFavorites([...favorites, productId]);
      showToast('Добавлено в избранное');
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const openContactModal = (config?: Partial<ContactModalConfig>) => {
    setContactModal({
      isOpen: true,
      title: config?.title || 'Запросить консультацию',
      subtitle: config?.subtitle || 'Инженеры компании свяжутся с вами для квалифицированной консультации и расчета',
      defaultProduct: config?.defaultProduct,
      defaultService: config?.defaultService,
      customMessage: config?.customMessage,
      formType: config?.formType || 'consultation',
      camSystem: config?.camSystem,
      isLicensedCam: config?.isLicensedCam,
    });
  };

  const closeContactModal = () => {
    setContactModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        navigateTo,
        activeCategory,
        setActiveCategory,
        customPages,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        services,
        addService,
        updateService,
        deleteService,
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        knowledgeBase,
        addKnowledgeItem,
        updateKnowledgeItem,
        deleteKnowledgeItem,
        companyInfo,
        updateCompanyInfo,
        siteTexts,
        textConstants,
        textConstantsRecords,
        textConstantsLoading,
        textConstantsSource,
        getText,
        refreshTextConstants: fetchGlobalTextConstants,
        updateTextConstant,
        updateSiteTexts,
        resetSiteTexts,
        importSiteTexts,
        exportAllDataJSON,
        importDataJSON,
        resetToDefaultData,
        resetCrmDatabase,
        models3D,
        setModels3D,
        addModel3D,
        updateModel3D,
        deleteModel3D,
        resetModels3D,
        selectedProduct,
        setSelectedProduct,
        selectedArticle,
        setSelectedArticle,
        selectedServiceId,
        setSelectedServiceId,
        selectedKnowledgeItem,
        setSelectedKnowledgeItem,
        selectedKnowledgeCategory,
        setSelectedKnowledgeCategory,
        navigationHistory,
        addToNavigationHistory,
        clearNavigationHistory,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareDrawerOpen,
        setIsCompareDrawerOpen,
        favorites,
        toggleFavorite,
        isFavorite,
        isSearchOpen,
        setIsSearchOpen,
        contactModal,
        openContactModal,
        closeContactModal,
        isCallbackModalOpen,
        callbackInitialData,
        openCallbackModal,
        closeCallbackModal,
        isConfiguratorModalOpen,
        setIsConfiguratorModalOpen,
        openConfiguratorModal,
        closeConfiguratorModal,
        isRoiCalculatorModalOpen,
        setIsRoiCalculatorModalOpen,
        openRoiCalculatorModal,
        closeRoiCalculatorModal,
        currentUser,
        authUsers,
        login,
        logout,
        register,
        isAdmin,
        isSuperAdmin,
        userPermissions,
        createUser,
        updateUser,
        deleteUser,
        updateUserPermissions,
        isPrivacyModalOpen,
        setIsPrivacyModalOpen,
        contracts,
        setContracts,
        certificates,
        setCertificates,
        metrologyReports,
        setMetrologyReports,
        fleetDevices,
        setFleetDevices,
        addFleetDevice,
        updateFleetDevice,
        deleteFleetDevice,
        addContract,
        updateContract,
        deleteContract,
        commercialProposals,
        setCommercialProposals,
        addCommercialProposal,
        updateCommercialProposal,
        deleteCommercialProposal,
        documentDetailLevel,
        setDocumentDetailLevel,
        funnels,
        setFunnels,
        updateFunnelStages,
        resetFunnelsToDefault,
        crmSettings,
        updateCrmSettings,
        deals,
        setDeals,
        addDeal,
        updateDeal,
        deleteDeal,
        supportTickets,
        setSupportTickets,
        addSupportTicket,
        updateSupportTicket,
        deleteSupportTicket,
        licenses,
        setLicenses,
        addLicense,
        updateLicense,
        deleteLicense,
        toastMessage,
        showToast,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

