export type PageId =
  | 'home'
  | 'software'
  | 'hardware'
  | 'services'
  | 'calculator'
  | 'about'
  | 'knowledge'
  | 'glossary'
  | 'news'
  | 'contacts'
  | 'account'
  | 'cms'
  | 'crm'
  | 'sitemap'
  | 'compare'
  | 'notfound'
  | `custom-${string}`;

export const SYSTEM_PAGE_IDS = new Set<string>([
  'home',
  'software',
  'hardware',
  'services',
  'about',
  'knowledge',
  'glossary',
  'news',
  'contacts',
  'account',
  'cms',
  'crm',
  'sitemap',
  'compare',
  'notfound'
]);

export interface NavigationHistoryItem {
  id: string;
  title: string;
  page: PageId;
  detailId?: string;
  category?: string;
  path: string;
  badge?: string;
  timestamp: number;
}

export interface PageCommentItem {
  id: string;
  author: string;
  role?: string; // e.g. "Главный технолог", "Инженер-метролог"
  company?: string; // e.g. "АО 'АВТОВАЗ'"
  rating?: number; // 1 to 5
  avatar?: string;
  date: string;
  content: string;
  verified?: boolean;
}

export interface CustomPageBlock {
  id: string;
  type: 'hero' | 'text' | 'features' | 'cta' | 'specs' | 'quote' | 'video' | 'image' | 'gallery' | 'comments' | 'html';
  title?: string;
  content?: string;
  subtitle?: string;
  image?: string;
  caption?: string;
  imageAlign?: 'center' | 'left' | 'right' | 'full';
  galleryImages?: { url: string; caption?: string }[];
  videoUrl?: string; // YouTube, RuTube, VK, Vimeo, or direct MP4 URL
  videoPoster?: string;
  videoCaption?: string;
  comments?: PageCommentItem[];
  allowNewComments?: boolean;
  htmlContent?: string;
  items?: string[];
  buttonText?: string;
  buttonAction?: 'contact' | 'software' | 'hardware' | 'services';
}

export interface CustomPage {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  id: string; // e.g. 'custom-training' or 'custom-special-offer'
  slug: string; // e.g. 'training-center'
  title: string;
  menuTitle: string;
  description: string;
  showInHeader: boolean;
  showInFooter: boolean;
  createdAt: string;
  updatedAt: string;
  blocks: CustomPageBlock[];
  content?: string;
  isPublished?: boolean;
}

export interface DualModeSpecRow {
  label: string;
  laserVal?: string;
  irVal?: string;
  singleVal?: string;
}

export interface DualModeSpecs {
  modeTitle1?: string;
  modeTitle2?: string;
  rows: DualModeSpecRow[];
  footnotes?: string[];
  systemReqs?: {
    os?: string;
    gpu?: string;
    vram?: string;
    cpu?: string;
    ram?: string;
  };
}

export interface ProductFaqItem {
  id?: string;
  question: string;
  answer: string;
  categoryTag?: string;
  highlight?: string;
}

export interface Product {
  id: string;
  type: 'software' | 'hardware';
  category: string;
  categoryLabel: string;
  name: string;
  brand: string;
  shortDescription: string;
  fullDescription: string;
  shortDesc?: string;
  fullDesc?: string;
  image: string;
  features: string[];
  specs?: Record<string, string>;
  dualModeSpecs?: DualModeSpecs;
  technology?: 'laser' | 'optical' | 'hybrid';
  technologyLabel?: string;
  sysReqs?: Record<string, string>;
  inStock?: boolean;
  featured?: boolean;
  badge?: string;
  price?: string | number;
  priceText?: string;
  officialUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  keywords?: string[];
  faq?: ProductFaqItem[];
  brochureUrl?: string;
  gallery?: string[];
  videoUrl?: string;
  downloads?: Array<{
    title: string;
    size?: string;
    type?: string;
    url?: string;
  }>;
}

export interface ServiceContact {
  id?: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  location?: string;
  url?: string;
  link?: string;
  telegramUrl?: string;
  website?: string;
}

export interface ServiceStep {
  stepNumber: number;
  title: string;
  desc: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category?: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  image: string;
  steps: { stepNumber: number; title: string; desc: string }[];
  deliverables: string[];
  equipmentUsed: string[];
  calculatorType: 'scanning' | 'reverse' | 'inspection' | 'postprocessor' | 'tooling' | 'cmm_service';
  basePriceText: string;
  features?: string[];
  advantages?: string[];
  leadTime?: string;
  priceFrom?: string;
  contacts?: ServiceContact[];
  responsiblePerson?: string;
  slaResponseTime?: string;
  workLocationNote?: string;
  brochureUrl?: string;
  fileUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  keywords?: string[];
}

export interface CaseStudy {
  id: string;
  title: string;
  clientIndustry: string;
  task: string;
  solution: string;
  results: string[];
  equipmentSoftware: string[];
  image: string;
  year: number;
  customerScope?: string;
  timeline?: string;
  accuracy?: string;
  standards?: string[];
  deliverables?: string[];
  economicEffect?: string;
  specialists?: string;
}

export interface Article {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  id: string;
  title: string;
  category: string;
  date: string;
  author?: string;
  readTime?: string;
  views?: number;
  preview: string;
  content: string | string[];
  tags: string[];
  image: string;
  videoUrl?: string; // Rutube format
  isHtml?: boolean;
  brochureUrl?: string;
  fileUrl?: string;
}

export type NewsArticle = Article;

export interface KnowledgeItem {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  id: string;
  title: string;
  category: 'ПО' | 'Оборудование' | 'Услуги' | 'Разработка постпроцессоров' | 'Общие вопросы' | 'Метрология и стандарты';
  summary: string;
  content: string;
  tags: string[];
  updatedAt?: string;
  dateAdded?: string;
  views?: number;
}

export interface Partner {
  name: string;
  country: string;
  status: string;
  description: string;
  logo: string;
  category?: 'hardware' | 'software' | 'scanners' | 'cmm' | 'cnc' | 'metrology';
  categoryLabel?: string;
  websiteUrl?: string;
  tags?: string[];
  featured?: boolean;
  logoMonogram?: string;
}

export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'CNY';

export interface CurrencyInfo {
  code: CurrencyCode;
  label: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  RUB: { code: 'RUB', label: 'Рубли (₽)', symbol: '₽', name: 'Рубли' },
  USD: { code: 'USD', label: 'Доллар США ($)', symbol: '$', name: 'Доллар США' },
  EUR: { code: 'EUR', label: 'Евро (€)', symbol: '€', name: 'Евро' },
  CNY: { code: 'CNY', label: 'Юани (¥)', symbol: '¥', name: 'Юани' }
};

export const CURRENCY_OPTIONS: { value: CurrencyCode; label: string; symbol: string }[] = [
  { value: 'RUB', label: 'Рубли (₽)', symbol: '₽' },
  { value: 'USD', label: 'Доллар США ($)', symbol: '$' },
  { value: 'EUR', label: 'Евро (€)', symbol: '€' },
  { value: 'CNY', label: 'Юани (¥)', symbol: '¥' }
];

export function getCurrencySymbol(code?: string): string {
  if (!code) return '₽';
  const c = code.toUpperCase();
  if (c === 'USD') return '$';
  if (c === 'EUR') return '€';
  if (c === 'CNY') return '¥';
  return '₽';
}

export function getCurrencyName(code?: string): string {
  if (!code) return 'Рубли';
  const c = code.toUpperCase();
  if (c === 'USD') return 'Доллар США';
  if (c === 'EUR') return 'Евро';
  if (c === 'CNY') return 'Юани';
  return 'Рубли';
}

export function formatCurrency(amount: number | string | undefined, currency: CurrencyCode | string = 'RUB'): string {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) || 0 : (amount || 0);
  const sym = getCurrencySymbol(currency);
  return `${num.toLocaleString('ru-RU')} ${sym}`;
}

export interface AttachedDocument {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadedAt: string;
  uploadedBy?: string;
  fileUrl?: string;
  fileType?: string;
}

export interface ProjectContract {
  id: string;
  number: string;
  title: string;
  company: string;
  date: string;
  status: 'Действует' | 'Выполнен (На гарантии)' | 'Сдан в эксплуатацию' | 'В процессе подписания' | 'Приостановлен' | 'Проект' | 'На согласовании' | 'Подписан' | 'Исполняется' | 'Завершен' | 'Расторгнут' | string;
  statusColor?: 'emerald' | 'blue' | 'gray' | 'amber' | 'purple' | 'red' | string;
  supportUntil: string;
  curator: string;
  curatorPhone?: string;
  amount?: string;
  currency?: CurrencyCode;
  vatRate?: number;
  vatMode?: 'standard' | 'export_zero' | 'no_vat' | 'custom';
  vatIncluded?: boolean;
  scope?: string;
  documents: AttachedDocument[];
  dealId?: string;
  dealTitle?: string;
}

export interface ProposalVersion {
  id: string;
  version: number;
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy?: string;
  fileUrl?: string;
  fileDataUrl?: string;
  mimeType?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'proposal' | 'nda' | 'contract' | 'spec' | 'certificate' | 'drawing' | string;
  size: string;
  date: string;
  url?: string;
  status?: string;
  fileDataUrl?: string;
  author?: string;
  mimeType?: string;
  dealId?: string;
  outgoingNumber?: string;
  amount?: number;
  currency?: CurrencyCode;
}

export interface CommercialProposal {
  id: string;
  outgoingNumber: string;
  date: string;
  toCompany: string;
  content: string;
  preparedBy: string;
  note: string;
  internalNotes: string;
  contactPerson: string;
  contactPhone: string;
  greeting?: string;
  title?: string;
  status?: string;
  items?: any[];
  dealId?: string;
  dealTitle?: string;
  dealStage?: string;
  dealFunnel?: 'services' | 'equipment' | 'support' | string;
  amount?: number;
  currency?: CurrencyCode;
  vatRate?: number; // Ставка НДС в % (по умолчанию 22%, для экспорта/соседних стран 0%)
  vatMode?: 'standard' | 'export_zero' | 'no_vat' | 'custom'; // Режим НДС
  customerCountry?: string; // Страна заказчика
  versions?: ProposalVersion[];
  isAlternative?: boolean; // Флаг АКП (Альтернативное коммерческое предложение)
  akpPurpose?: 'partner_tender' | 'alternative_supply'; // Назначение АКП: 'partner_tender' (Для партнеров / тендеров — серый фон) или 'alternative_supply' (Альтернативная поставка — без серого фона)

  // Hardened Reader Document Model fields (null-safe compatibility)
  documentNumber?: string;
  documentDate?: string;
  validUntil?: string;
  isNeutralTemplate?: boolean; // Обезличенный нейтральный шаблон (без упоминаний ООО «ДС-Инжиниринг» и без номеров)
  templateMode?: 'official' | 'impersonal'; // Режим шаблона: официальный ДС-Инжиниринг или обезличенный (White-label)
  impersonalSignerName?: string; // ФИО подписанта для обезличенного шаблона
  customLogoUrl?: string; // Пользовательский логотип для нейтрального шаблона
  documentImages?: { id: string; url: string; title?: string; caption?: string; widthPercent?: number; placement?: string }[]; // Иллюстрации и схемы в теле документа
  incomingNumber?: string; // Номер входящего запроса/письма (Ответ на №)
  incomingDate?: string; // Дата входящего запроса/письма (от ...)
  hasIncomingRef?: boolean; // Флаг наличия ссылки на входящий номер
  executorName?: string; // ФИО исполнителя (внизу бланка)
  executorPosition?: string; // Должность исполнителя
  executorPhone?: string; // Телефон исполнителя
  executorEmail?: string; // E-mail исполнителя
  fontFamily?: 'times' | 'arial' | 'calibri' | 'verdana' | string; // Гарнитура (по умолчанию Times New Roman)
  tableBorderColor?: string; // Цвет границ таблиц (по умолчанию #000000)
  tableBorderWidth?: string; // Толщина границ (1px, 2px, etc)
  tableBorderStyle?: 'solid' | 'double' | 'dashed' | 'none'; // Стиль границ
  tableCellPadding?: 'compact' | 'standard' | 'spacious'; // Отступы ячеек
  signatoryName?: string;
  signatoryRole?: string;
  signatoryPhone?: string;
  signatoryEmail?: string;
  hasStamp?: boolean;
  hasSignature?: boolean;
  subtotalWithoutVat?: number;
  vatAmount?: number;
  totalWithVat?: number;
  contractId?: string;
  contractNumber?: string;
  contractDate?: string;
  fileUrl?: string;
  fileDataUrl?: string;
  fileSize?: string;
  mimeType?: string;
  sourceLeadId?: string;
  metadata?: Record<string, any>;
}

export interface TicketMessage {
  id: string;
  author: string;
  authorRole: 'client' | 'engineer' | 'admin';
  text: string;
  date: string;
  attachments?: AttachedDocument[];
}

export interface SupportTicketItem {
  id: string;
  subject: string;
  product: string;
  clientCompany: string;
  clientName: string;
  date: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'Низкий' | 'Средний' | 'Высокий' | 'Критический';
  description: string;
  assignedEngineer?: string;
  lastReply?: string;
  messages: TicketMessage[];
  attachments: AttachedDocument[];
  dealId?: string;
  contractId?: string;
}

export interface LicenseItem {
  id: string;
  title: string;
  productName: string;
  type: 'Сетевая лицензия PDM' | 'Локальный Dongle USB' | 'Sentinel HASP HL' | 'FlexLM Network' | 'Облачная подписка';
  status: 'Активна' | 'Истекает' | 'Требуется обновление' | 'Заблокирована';
  company: string;
  haspId?: string;
  seatsCount?: string;
  licenseServer?: string;
  hardwareModel?: string;
  validUntil?: string;
  supportUntil?: string;
  notes?: string;
  files: AttachedDocument[];
  dealId?: string;
  contractId?: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  product: string;
  date: string;
  status: 'Открыт' | 'В работе' | 'Решен';
  priority: 'Низкий' | 'Средний' | 'Высокий' | 'Критический';
  messagesCount: number;
}

export interface SavedOrder {
  id: string;
  date: string;
  type: 'Поставка ПО' | 'Поставка оборудования' | 'Инжиниринговая услуга';
  title: string;
  status: 'Выполнен' | 'В обработке' | 'Доставка' | 'Техподдержка активна';
  amount?: string;
}

export interface UserPermissions {
  canAccessCrm: boolean;            // Доступ к CRM и воронкам продаж
  canEditDeals: boolean;            // Создание и изменение этапов активных сделок
  canReopenClosedDeals: boolean;    // Возврат в работу завершенных/отмененных сделок
  canDeleteDeals: boolean;          // Удаление сделок
  canAccessCms: boolean;            // Доступ к панели управления CMS
  canManageUsers: boolean;          // Создание пользователей и настройка прав
  canExportReports: boolean;        // Экспорт финансовой аналитики и отчетов
  canManageContracts: boolean;      // Управление договорами и проектами (добавление, редактирование, файлы)
  canManageTickets: boolean;        // Управление техподдержкой (ответы инженера, смена статусов, файлы)
  canManageLicenses: boolean;       // Управление лицензиями и ключами (добавление, генерация, файлы)
  canManage3DModels?: boolean;      // Управление 3D-моделями и файлами (копирование, сохранение, добавление, удаление)
  canViewCertificates?: boolean;    // Доступ к реестру свидетельств и сертификатов
  canViewMetrologyReports?: boolean; // Доступ к реестру метрологических отчетов
}

export const DEFAULT_ROLE_PERMISSIONS: Record<'superadmin' | 'admin' | 'moderator' | 'manager' | 'client', UserPermissions> = {
  superadmin: {
    canAccessCrm: true,
    canEditDeals: true,
    canReopenClosedDeals: true,
    canDeleteDeals: true,
    canAccessCms: true,
    canManageUsers: true,
    canExportReports: true,
    canManageContracts: true,
    canManageTickets: true,
    canManageLicenses: true,
    canManage3DModels: true,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
  admin: {
    canAccessCrm: true,
    canEditDeals: true,
    canReopenClosedDeals: true,
    canDeleteDeals: true,
    canAccessCms: true,
    canManageUsers: true,
    canExportReports: true,
    canManageContracts: true,
    canManageTickets: true,
    canManageLicenses: true,
    canManage3DModels: true,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
  moderator: {
    canAccessCrm: false,
    canEditDeals: false,
    canReopenClosedDeals: false,
    canDeleteDeals: false,
    canAccessCms: true,
    canManageUsers: false,
    canExportReports: false,
    canManageContracts: false,
    canManageTickets: false,
    canManageLicenses: false,
    canManage3DModels: true,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
  manager: {
    canAccessCrm: true,
    canEditDeals: true,
    canReopenClosedDeals: false,
    canDeleteDeals: false,
    canAccessCms: false,
    canManageUsers: false,
    canExportReports: true,
    canManageContracts: true,
    canManageTickets: true,
    canManageLicenses: true,
    canManage3DModels: false,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
  client: {
    canAccessCrm: false,
    canEditDeals: false,
    canReopenClosedDeals: false,
    canDeleteDeals: false,
    canAccessCms: false,
    canManageUsers: false,
    canExportReports: false,
    canManageContracts: false,
    canManageTickets: false,
    canManageLicenses: false,
    canManage3DModels: false,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
};

export const getUserPermissions = (user: UserProfile | AuthAccount | null | undefined): UserPermissions => {
  if (!user) return DEFAULT_ROLE_PERMISSIONS.client;
  const base = DEFAULT_ROLE_PERMISSIONS[user.role] || DEFAULT_ROLE_PERMISSIONS.client;
  if (!user.permissions) return base;
  return {
    canAccessCrm: typeof user.permissions.canAccessCrm === 'boolean' ? user.permissions.canAccessCrm : base.canAccessCrm,
    canEditDeals: typeof user.permissions.canEditDeals === 'boolean' ? user.permissions.canEditDeals : base.canEditDeals,
    canReopenClosedDeals: typeof user.permissions.canReopenClosedDeals === 'boolean' ? user.permissions.canReopenClosedDeals : base.canReopenClosedDeals,
    canDeleteDeals: typeof user.permissions.canDeleteDeals === 'boolean' ? user.permissions.canDeleteDeals : base.canDeleteDeals,
    canAccessCms: typeof user.permissions.canAccessCms === 'boolean' ? user.permissions.canAccessCms : base.canAccessCms,
    canManageUsers: typeof user.permissions.canManageUsers === 'boolean' ? user.permissions.canManageUsers : base.canManageUsers,
    canExportReports: typeof user.permissions.canExportReports === 'boolean' ? user.permissions.canExportReports : base.canExportReports,
    canManageContracts: typeof user.permissions.canManageContracts === 'boolean' ? user.permissions.canManageContracts : base.canManageContracts,
    canManageTickets: typeof user.permissions.canManageTickets === 'boolean' ? user.permissions.canManageTickets : base.canManageTickets,
    canManageLicenses: typeof user.permissions.canManageLicenses === 'boolean' ? user.permissions.canManageLicenses : base.canManageLicenses,
    canManage3DModels: typeof user.permissions.canManage3DModels === 'boolean' ? user.permissions.canManage3DModels : (base.canManage3DModels ?? (user.role === 'superadmin' || user.role === 'admin' || user.role === 'moderator')),
  };
};

export const canUserManage3DModels = (user: UserProfile | AuthAccount | null | undefined): boolean => {
  if (!user) return false;
  if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'moderator') return true;
  return Boolean(user.permissions?.canManage3DModels);
};

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'manager' | 'client';
  company: string;
  position: string;
  phone: string;
  contractNumber?: string;
  avatar?: string;
  createdAt?: string;
  permissions?: UserPermissions;
}

export interface AuthAccount extends UserProfile {
  password?: string;
}

export type FaqCategoryGroup = 
  | 'all'
  | 'dispatch_nda'     // Выезд инженеров и NDA
  | 'scanning_cad'     // Сканирование, форматы, сдача КД
  | 'metrology_arshin' // КИМ, помещения и ФГИС «АРШИН»
  | 'software_licenses'; // Лицензирование ПО и ЧПУ

/** Ключ группы FAQ (все группы, кроме служебной «все вопросы») */
export type FaqGroupId = Exclude<FaqCategoryGroup, 'all'>;

export interface FaqGroupDefinition {
  id: FaqCategoryGroup;
  label: string;
  description: string;
  icon?: string;
}

export interface FaqItem {
  id: string;
  category: 'software' | 'hardware' | 'services' | 'postprocessors' | 'training' | 'metrology';
  categoryLabel: string;
  group?: FaqGroupId;
  groupLabel?: string;
  tags?: string[];
  question: string;
  answer: string;
  highlight?: string;
  actionText?: string;
  actionPage?: 'software' | 'hardware' | 'services' | 'contacts' | 'calculator';
  actionTargetId?: string;
}

export interface PageVisitStat {
  pageId: string;
  title: string;
  category: 'main' | 'catalog' | 'services' | 'info' | 'custom' | 'system';
  path: string;
  visitCount: number;
  lastVisited: string;
  firstVisited?: string;
}

export interface ServerRFQ {
  id: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  serviceType: string;
  details: string;
  estimatedPrice?: number;
  cadFormat?: string;
  createdAt: string;
}

export interface ServerB2BTicket {
  id: string;
  organizationId: string;
  title: string;
  category: 'calibration' | 'repair' | 'postprocessor' | 'reverse_engineering' | 'consulting';
  status: 'new' | 'in_progress' | 'awaiting_customer' | 'completed';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  equipmentModel?: string;
  equipmentSerial?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  attachments?: { fileName: string; fileSizeMb: number; fileUrl: string }[];
}

export interface BoundaryValidationResult {
  valid: boolean;
  errors: string[];
  recommendations: string[];
  timestamp: string;
  validatedInput: {
    dimensionsMm?: number;
    requiredToleranceMm?: number;
    batchQuantity?: number;
    serviceType?: string;
  };
}

export interface NASStorageInfo {
  status: string;
  nasType: string;
  storageProtocol: string;
  supportedFileTypes: string[];
  maxFileSizeBytes: number;
  encryption: string;
  backupSchedule: string;
}

export interface EngineeringEquipmentItem {
  id: string;
  name: string;
  brand: string;
  category: 'scanner' | 'mobile_cmm' | 'stationary_cmm' | 'software';
  categoryLabel: string;
  typeLabel: string;
  accuracy: string;
  description: string;
  application: string;
  mobility: 'Портативное (выездное)' | 'Стационарное (метрологический зал)' | 'Программный комплекс';
  image: string;
  features: string[];
  specs?: Record<string, string>;
}

export interface DepartmentContact {
  role: string;
  name: string;
  phone: string;
  phoneClean: string;
  email: string;
  note: string;
  avatar?: string;
}

export interface CompanyLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  badge: string;
  purpose: string;
  description: string;
  phone?: string;
  email?: string;
  workHours?: string;
  equipmentSummary?: string;
  coordinates?: { lat: number; lng: number };
  features: string[];
}

export interface ManagerSmtpAccount {
  id: string;
  managerId: string; // e.g. 'adm-01', 'adm-02', 'adm-03', 'adm-04', 'adm-05', 'adm-06'
  fullName: string;
  roleTitle: string;
  email: string; // e.g. 'info@ds-enginering.ru' for director, 'a.skobelev@ds-enginering.ru', etc.
  host: string; // 'smtp.yandex.ru'
  port: number; // 465
  secure: boolean; // true
  authType: 'yandex_app_password';
  user: string; // 'info@ds-enginering.ru'
  pass: string; // Yandex App Password
  passMasked?: string;
  fromName: string;
  replyTo?: string;
  isDirector?: boolean;
  status: 'connected' | 'configured' | 'pending_auth' | 'error';
  lastTestedAt?: string;
  lastTestMessage?: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  enabled: boolean;
  provider?: 'yandex_360' | 'custom_smtp';
  triggers: {
    newRfq: boolean;
    assignedManager: boolean;
    stageChanged: boolean;
    ticketReply: boolean;
    licenseExpiry: boolean;
    [key: string]: boolean | undefined;
  };
  managerAccounts?: ManagerSmtpAccount[];
  customTriggersMetadata?: { id: string, name: string, description: string, icon?: string }[];
}

export interface EmailOutboxItem {
  id: string;
  timestamp: string;
  from?: string;
  fromName?: string;
  senderManagerId?: string;
  to: string;
  toName?: string;
  subject: string;
  templateType: 'rfq_created' | 'deal_stage' | 'ticket_reply' | 'manager_assigned' | 'custom_b2b' | 'license_reminder';
  status: 'sent' | 'failed' | 'simulated';
  dealId?: string;
  ticketId?: string;
  error?: string;
}

export interface CorporateEmailTemplate {
  id: 'rfq_created' | 'deal_stage' | 'ticket_reply' | 'manager_assigned' | 'license_reminder' | 'custom_b2b' | string;
  name: string;
  description: string;
  subject: string;
  title: string;
  headerBadge: string;
  greeting: string;
  mainMessage: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
  showDetailsTable?: boolean;
  updatedAt?: string;
}





export interface TrainingCertificate {
  id: string;
  certificateNumber: string;
  date: string;
  traineeName: string;
  customer: string;
  instructor: string;
  trainingTopic?: string;
  files: AttachedDocument[];
  // Rich Visual & Graphic Editor Fields
  traineePosition?: string;
  certificateType?: 'training' | 'briefing' | 'qualification' | 'software_cert' | string;
  trainingProgramText?: string;
  hoursTotal?: number;
  protocolNumber?: string;
  protocolDate?: string;
  validUntil?: string;
  templateTheme?: 'corporate_gold' | 'metrology_strict' | 'modern_polyworks' | 'tech_scanning' | string;
  customPrimaryColor?: string;
  showStamp?: boolean;
  showSignature?: boolean;
  showQrCode?: boolean;
  leftLogo?: 'hexagon' | 'ds_engineering' | 'topsolid' | 'shining3d' | 'pmt' | 'leica' | '3dsystems' | 'none' | 'custom' | string;
  rightLogo?: 'polyworks' | 'innovmetric' | 'arshin' | 'geomagic' | 'topsolid' | 'none' | 'custom' | string;
  headerSubtitle?: string;
  footerNote?: string;
  // Full layout and graphic customization fields
  certificateTitle?: string;
  certificateGivenToText?: string;
  traineeNameFontSize?: number;
  bodyTextFontSize?: number;
  bodyTextMarginTop?: number;
  watermarkType?: 'hexagon_global_cmm' | 'hexagon_arm' | 'shining_freescan' | 'leica_tracker' | 'topsolid_cnc' | 'custom' | 'none' | string;
  watermarkUrl?: string;
  watermarkOpacity?: number;
  customLeftLogoUrl?: string;
  customRightLogoUrl?: string;
  showDsLogoBottom?: boolean;
  customDsLogoUrl?: string;
  stampType?: 'official_ds' | 'for_certs' | 'custom' | 'none' | string;
  customStampUrl?: string;
  signatureType?: 'director_facsimile' | 'custom' | 'none' | string;
  customSignatureUrl?: string;
  signatoryName?: string;
  signatoryPosition?: string;
  signatoryCompany?: string;
  footerAddressText?: string;
}

export type FleetDeviceStatus = 'in_office' | 'on_site' | 'in_verification' | 'maintenance' | 'presentation' | 'training' | 'other';

export interface CompanyFleetDevice {
  id: string;
  catalogProductId?: string; // ID модели из общего каталога сайта
  modelName: string;         // Название модели (напр. Hexagon Absolute Arm 8525-7)
  brand: string;             // Производитель (напр. Hexagon, Shining 3D, Leica, PMT)
  category?: string;         // Категория (Измерительные руки, 3D-сканеры, Трекеры, КИМ)
  serialNumber: string;      // Заводской серийный номер (напр. 8525-4491-RU)
  inventoryNumber: string;   // Внутренний инвентарный номер (напр. ИНВ-ДС-042)
  status: FleetDeviceStatus; // Статус нахождения
  statusLabel?: string;
  verificationNumber: string; // Номер свидетельства о поверке (ФГИС «АРШИН»)
  verificationDate?: string;  // Дата прохождения поверки (ГГГГ-ММ-ДД)
  verificationValidUntil: string; // Срок действия поверки (ГГГГ-ММ-ДД)
  verificationDocUrl?: string; // Скан свидетельства о поверке (PDF/JPG)
  currentLocation?: string;   // Текущее местоположение / объект заказчика
  responsiblePerson?: string; // Ответственный метролог / инженер
  notes?: string;             // Комплектация / примечания (датчики, щупы, скан-насадки)
  photoUrl?: string;          // Фото прибора
  accuracy?: string;          // Точность / погрешность (напр. 0.015 мм)
  measuringRange?: string;    // Диапазон измерений (напр. 2.5 м)
  createdAt?: string;
  updatedAt?: string;
}

export interface MetrologyReport {
  id: string;
  reportNumber: string;
  date: string;
  objectName: string;
  customer: string;
  engineer: string;
  equipment: string;
  fleetDeviceId?: string;
  equipmentSerial?: string;
  inventoryNumber?: string;
  verificationCertificate?: string;
  verificationValidUntil?: string;
  isVerificationExpired?: boolean;
  files: AttachedDocument[];
}

// --- ONLINE ENGINEER CHAT & MANAGER HANDOVER TYPES ---
export interface OnlineEngineerSuggestion {
  label: string;
  actionType: 'navigate' | 'contact' | 'modal' | 'call' | 'handover';
  page?: PageId;
  detailId?: string;
  modalConfig?: any;
  url?: string;
}

export interface OnlineEngineerMessage {
  id: string;
  sender: 'engineer' | 'user' | 'manager' | 'system';
  text: string;
  time: string;
  timestamp?: number;
  suggestions?: OnlineEngineerSuggestion[];
  isManagerHandover?: boolean;
}

export interface OnlineEngineerSession {
  id: string;
  visitorId: string;
  visitorName?: string;
  contactPhone?: string;
  contactEmail?: string;
  companyName?: string;
  currentPage?: string;
  currentPath?: string;
  status: 'active' | 'handover_requested' | 'manager_connected' | 'resolved';
  messages: OnlineEngineerMessage[];
  lastMessageText: string;
  createdAt: string;
  updatedAt: string;
  unreadByManager?: boolean;
  urgentAlert?: boolean;
  leadId?: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  isUserMessage?: boolean;
  isHandoverSubmit?: boolean;
  metadata?: Record<string, any>;
}

// --- CRM USER TASKS & CALENDAR TYPES ---
export type TaskPriority = 'low' | 'medium' | 'urgent';
export type TaskStatus = 'new' | 'in_progress' | 'completed' | 'postponed';
export type TaskTargetType = 'personal' | 'deal' | 'company' | 'contact';
export type TaskReminderOption = 'none' | 'at_due' | '15_min_before' | '1_hour_before';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface UserTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  dueDateTime: string; // ISO string
  priority: TaskPriority;
  status: TaskStatus;
  checklist: TaskChecklistItem[];
  targetType: TaskTargetType;
  targetId?: string;
  targetTitle?: string;
  dealId?: string;
  companyId?: string;
  contactId?: string;
  managerId: string;
  managerName: string;
  reminder: TaskReminderOption;
  reminderTriggered?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CalendarEventType = 'call' | 'meeting' | 'demo' | 'maintenance' | 'presentation' | 'training' | 'other';
export type CalendarEventStatus = 'scheduled' | 'completed' | 'cancelled';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  customType?: string;
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  location?: string;
  companyId?: string;
  companyName?: string;
  contactId?: string;
  contactName?: string;
  dealId?: string;
  dealTitle?: string;
  managerId: string;
  managerName: string;
  status: CalendarEventStatus;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// --- CLIENT CONTACT CENTER TYPES ---
export interface CompanyEquipmentItem {
  id?: string;
  name: string;
  brand?: string;
  serial?: string;
  type?: 'КИМ' | '3D-сканер' | 'Лазерный трекер' | 'Станок ЧПУ' | 'ПО' | 'Прочее' | string;
  category?: 'software' | 'scanners' | 'cmm' | 'trackers' | 'cnc' | 'other' | string;
  verificationDate?: string;
  warrantyUntil?: string;
  location?: string;
  notes?: string;
}

export type CompanyStatus = 'active' | 'potential' | 'key_partner' | 'in_progress' | 'archive';

export interface CrmCompany {
  id: string;
  name: string;
  inn: string;
  kpp?: string;
  industry: string;
  city: string;
  address?: string;
  status: CompanyStatus;
  assignedEquipment: CompanyEquipmentItem[];
  phone: string;
  email: string;
  contactPerson?: string;
  ceoName?: string;
  ceoPost?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInteraction {
  id: string;
  date: string;
  type: 'call' | 'meeting' | 'email' | 'demo' | 'other';
  comment: string;
  author: string;
}

export interface CrmContact {
  id: string;
  companyId?: string;
  companyName: string;
  fullName: string;
  position: string;
  department?: string;
  workPhone?: string;
  mobilePhone?: string;
  email: string;
  isDecisionMaker: boolean; // ЛПР
  notes?: string;
  interactionHistory: ContactInteraction[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientListFilter {
  industries?: string[];
  cities?: string[];
  equipmentTypes?: string[];
  status?: string[];
}

export interface ClientSegmentList {
  id: string;
  name: string;
  description?: string;
  filters: ClientListFilter;
  companyIds: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
export interface SiteTopic { id: string; title: string; keywords: string[]; page: PageId; detailId?: string; summary: string; actionLabel: string; }

export interface NotificationSettings {
  browserPopup: boolean;
  soundAlert: boolean;
  soundVolume?: number;
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  telegramTemplate?: string;
  telegramBotTokenConfigured?: boolean;
  telegramTokenFromEnv?: boolean;
  telegramChatIdFromEnv?: boolean;
  telegramMaskedToken?: string;
  telegramEffectiveChatId?: string;
  emailEnabled: boolean;
  alertEmail: string;
  emailSubjectPrefix?: string;
  maxEnabled: boolean;
  maxWebhookUrl: string;
  maxBotToken?: string;
  maxChatId?: string;
  maxBotTokenConfigured?: boolean;
  maxTokenFromEnv?: boolean;
  maxChatIdFromEnv?: boolean;
  maxWebhookFromEnv?: boolean;
  maxMaskedToken?: string;
  maxEffectiveChatId?: string;
  maxEffectiveWebhookUrl?: string;
  notifyOnCallback: boolean;
  notifyOnConsultation: boolean;
  notifyOnChatLead: boolean;
  notifyOnTicket: boolean;
  slaCallbackMinutes?: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  updatedAt?: string;
}

export interface ManagerNotificationItem {
  id: string;
  type: 'callback' | 'consultation' | 'rfq' | 'chat_lead' | 'ticket' | 'user_registration';
  title: string;
  customerName: string;
  phone: string;
  companyName?: string;
  email?: string;
  topic?: string;
  preferredTime?: string;
  comment?: string;
  callId?: string;
  dealId?: string;
  taskId?: string;
  createdAt: string;
  read: boolean;
  channels: {
    popup: 'delivered' | 'pending';
    telegram?: 'sent' | 'failed' | 'not_configured' | 'skipped' | 'pending';
    email?: 'sent' | 'failed' | 'simulated' | 'skipped' | 'pending';
    maxWebhook?: 'sent' | 'failed' | 'not_configured' | 'skipped' | 'pending';
  };
}

export interface ContactFormSubmission {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  department?: string;
  message?: string;
  sourcePage?: string;
  agree?: boolean;
}

export interface EmailNotificationResult {
  success: boolean;
  id?: string;
  message?: string;
  emailSent?: boolean;
  emailSimulated?: boolean;
  recipients?: string[];
  error?: string;
}

// ==========================================
// 3D WebGL CAD & Scan Metrology Models
// ==========================================

export type ViewerMode = 'cad' | 'mesh' | 'colormap' | 'points';

export type GeometryPresetType = 
  | 'procedural_impeller' 
  | 'procedural_mold' 
  | 'procedural_housing' 
  | 'procedural_bevel_gear' 
  | 'procedural_volute' 
  | 'custom_url';

export interface InspectionPoint {
  id: string;
  name: string;
  coords: [number, number, number];
  deviation: number;
  status: 'nominal' | 'warning' | 'critical';
  surfaceName: string;
}

export interface Model3DItem {
  id: string;
  name: string;
  category: string;
  geometryType: GeometryPresetType;
  description: string;
  material?: string;
  manufacturingProcess?: string;
  pointCount: number;
  triangleCount: number;
  minTolerance: number;
  maxTolerance: number;
  inspectionPoints: InspectionPoint[];
  customMeshUrl?: string;
  // Custom uploaded 3D files for the 3 representation options:
  cadFileUrl?: string;          // 3D CAD-модель: .stp, .step, .iges, .obj
  cadFileName?: string;
  cadFileSize?: string;
  scanMeshUrl?: string;         // 3D-скан (полигональная сетка): .stl, .ply, .obj
  scanMeshFileName?: string;
  scanMeshFileSize?: string;
  pointCloudUrl?: string;       // Облако точек (лазерный скан): .xyz, .pts, .asc, .txt, .csv
  pointCloudFileName?: string;
  pointCloudFileSize?: string;
  orderIndex: number;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// Site Text Constants (PostgreSQL text_constants)
// ==========================================

export interface TextConstantItem {
  id: number;
  key: string;
  category: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface TextConstantsApiResponse {
  success: boolean;
  source: 'database_table' | 'fallback' | 'fallback_after_db_error' | 'memory_fallback' | string;
  table: string;
  count: number;
  total: number;
  constants: TextConstantItem[];
  records: TextConstantItem[];
  dictionary: Record<string, string>;
  data: any; // SiteTextsData
  timestamp: string;
  warning?: string;
  dbError?: {
    message: string;
    code: string;
  };
}

export type { ExtendedDeal } from './data/mockCrmData';


